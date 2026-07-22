import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

@Injectable()
export class PaymentQueryService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getPhotographerTransactions(
    photographerId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      method?: string;
      sortBy?: string;
      sortOrder?: string;
      filterDate?: string;
    } = {},
  ) {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'res')
      .leftJoinAndSelect('res.customer', 'customer')
      .where('res.photographerId = :photographerId', { photographerId });

    // Handle sorting
    const sortBy = query.sortBy || 'date';
    const sortOrder = (query.sortOrder === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    if (sortBy === 'amount') {
      qb.orderBy('payment.amountInCents', sortOrder);
    } else {
      qb.orderBy('payment.createdAt', sortOrder);
    }

    if (query.status && query.status !== 'ALL') {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.method && query.method !== 'ALL') {
      if (query.method === 'CASH') {
        qb.andWhere('payment.cardBrand = :cardBrand', {
          cardBrand: 'Offline Payment',
        });
      } else if (query.method === 'CARD') {
        qb.andWhere('payment.cardBrand != :cardBrand', {
          cardBrand: 'Offline Payment',
        });
      }
    }

    if (query.filterDate) {
      qb.andWhere('DATE(payment.createdAt) = :filterDate', {
        filterDate: query.filterDate,
      });
    }

    if (query.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        `(
          LOWER(customer.firstName) LIKE :search
          OR LOWER(customer.lastName) LIKE :search
          OR LOWER(customer.email) LIKE :search
          OR LOWER(payment.transactionId) LIKE :search
          OR LOWER(payment.cardBrand) LIKE :search
        )`,
        { search: searchPattern },
      );
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const statsQb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'res')
      .where('res.photographerId = :photographerId', { photographerId })
      .andWhere('payment.status = :successStatus', {
        successStatus: PaymentStatus.SUCCESS,
      });

    const stats = await statsQb
      .select('SUM(payment.amountInCents)', 'totalAmount')
      .addSelect(
        "SUM(CASE WHEN payment.cardBrand = 'Offline Payment' THEN 1 ELSE 0 END)",
        'cashCount',
      )
      .addSelect(
        "SUM(CASE WHEN payment.cardBrand != 'Offline Payment' THEN 1 ELSE 0 END)",
        'cardCount',
      )
      .getRawOne();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalRevenueInCents: parseInt(stats?.totalAmount || '0', 10),
        cashPaymentsCount: parseInt(stats?.cashCount || '0', 10),
        cardPaymentsCount: parseInt(stats?.cardCount || '0', 10),
      },
    };
  }

  async getReservationPayments(reservationId: string, userId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId, photographerId: userId },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return this.paymentRepository.find({
      where: { reservationId, status: PaymentStatus.SUCCESS },
    });
  }
}
