import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { UserRole } from '../../entities/user.entity';
import { ChatGateway } from '../chat.gateway';
import { JwtUser } from '../interfaces/jwt-user.interface';

@Injectable()
export class ReservationsQueryService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly chatGateway: ChatGateway,
  ) {}

  private async autoCompletePastReservations(): Promise<void> {
    const todayStr = new Date().toISOString().split('T')[0];
    await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set({ status: ReservationStatus.COMPLETED })
      .where('status = :confirmedStatus', {
        confirmedStatus: ReservationStatus.CONFIRMED,
      })
      .andWhere('date < :todayStr', { todayStr })
      .execute();
  }

  async findAll(
    user: JwtUser,
    queryOptions: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {},
  ) {
    await this.autoCompletePastReservations();

    const qb = this.reservationRepository
      .createQueryBuilder('res')
      .leftJoinAndSelect('res.customer', 'customer')
      .leftJoinAndSelect('res.photographer', 'photographer');

    if (user.role === UserRole.PHOTOGRAPHER) {
      qb.andWhere('res.photographerId = :photographerId', {
        photographerId: user.userId,
      });
    }

    if (queryOptions.status && queryOptions.status !== 'ALL') {
      qb.andWhere('res.status = :status', { status: queryOptions.status });
    }

    if (queryOptions.startDate && queryOptions.endDate) {
      qb.andWhere('res.date >= :startDate AND res.date <= :endDate', {
        startDate: queryOptions.startDate,
        endDate: queryOptions.endDate,
      });
    }

    if (queryOptions.search) {
      const searchPattern = `%${queryOptions.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(customer.firstName) LIKE :search OR LOWER(customer.lastName) LIKE :search OR LOWER(customer.email) LIKE :search OR LOWER(res.location) LIKE :search OR LOWER(res.eventType) LIKE :search OR LOWER(photographer.firstName) LIKE :search OR LOWER(photographer.lastName) LIKE :search OR CAST(res.id AS text) LIKE :search)',
        { search: searchPattern },
      );
    }

    const ALLOWED_SORT_FIELDS: Record<string, string> = {
      date: 'res.date',
      createdAt: 'res.createdAt',
      customerFirstName: 'customer.firstName',
    };
    const sortField =
      ALLOWED_SORT_FIELDS[queryOptions.sortBy || ''] || 'res.date';
    const sortDir =
      queryOptions.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(sortField, sortDir).addOrderBy('res.startTime', 'ASC');

    if (queryOptions.startDate && queryOptions.endDate) {
      return qb.getMany();
    }

    const page = queryOptions.page || 1;
    const limit = queryOptions.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: JwtUser) {
    await this.autoCompletePastReservations();

    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { customer: true, photographer: true, messages: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (
      user.role === UserRole.PHOTOGRAPHER &&
      reservation.photographerId !== user.userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return reservation;
  }

  async updateStatus(id: string, status: ReservationStatus, user: JwtUser) {
    const reservation = await this.findOne(id, user);
    reservation.status = status;
    const saved = await this.reservationRepository.save(reservation);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', saved);
    this.chatGateway.server
      .to(`photographer_${user.userId}`)
      .emit('reservationUpdated', saved);
    return saved;
  }
}
