import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import * as crypto from 'crypto';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Customer } from '../entities/customer.entity';
import { User, UserRole } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { Message } from '../entities/message.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ProposeQuotationDto } from './dto/propose-quotation.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ChatGateway } from './chat.gateway';
import { EmailService } from '../email/email.service';
import { ReservationsQuotationService } from './reservations-quotation.service';
import { ReservationsLifecycleService } from './reservations-lifecycle.service';

interface JwtUser {
  userId: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(PhotographerProfile)
    private profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private chatGateway: ChatGateway,
    private emailService: EmailService,
    private quotationService: ReservationsQuotationService,
    private lifecycleService: ReservationsLifecycleService,
  ) {}

  async findAll(
    user: JwtUser,
    queryOptions: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ) {
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

    qb.orderBy('res.date', 'DESC').addOrderBy('res.startTime', 'ASC');

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

  async createManualBooking(dto: CreateManualBookingDto, user: JwtUser) {
    return this.lifecycleService.createManualBooking(dto, user);
  }

  async proposeQuotation(id: string, dto: ProposeQuotationDto, user: JwtUser) {
    const reservation = await this.findOne(id, user);
    return this.quotationService.proposeQuotation(reservation, dto, user);
  }

  async rejectReservation(
    id: string,
    dto: RejectReservationDto,
    user: JwtUser,
  ) {
    const reservation = await this.findOne(id, user);
    return this.quotationService.rejectReservation(reservation, dto, user);
  }

  async getMessages(id: string, user: JwtUser) {
    await this.findOne(id, user);

    return this.messageRepository.find({
      where: { reservationId: id },
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(id: string, content: string, user: JwtUser) {
    const reservation = await this.findOne(id, user);

    const message = this.messageRepository.create({
      reservationId: id,
      sender: 'PHOTOGRAPHER',
      senderName: user.firstName || 'Photographer',
      content,
    });
    await this.messageRepository.save(message);

    this.chatGateway.server.to(`reservation_${id}`).emit('message', message);
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('messageReceived', { reservationId: id, message });

    return message;
  }
}
