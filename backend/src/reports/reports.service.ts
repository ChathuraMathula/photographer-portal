import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import {
  buildFinancialReportPdf,
  buildBookingsReportPdf,
  buildLocationReportPdf,
} from './reports-pdf-builder';
import { ReportsAggregationService } from './reports-aggregation.service';
import { ElasticReportsAggregationService } from './elastic-reports-aggregation.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly aggregationService: ElasticReportsAggregationService,
  ) {}

  async generateReportData(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ) {
    return this.aggregationService.generateReportData(
      photographerId,
      period,
      customStartDate,
      customEndDate,
    );
  }

  async getReportBookings(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    customStartDate?: string,
    customEndDate?: string,
  ) {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === 'weekly') {
        startDate.setDate(today.getDate() - 7);
      } else if (period === 'monthly') {
        startDate.setDate(today.getDate() - 30);
      } else if (period === 'yearly') {
        startDate.setDate(today.getDate() - 365);
      }
    }

    const whereClause: any = {
      date: Between(startDate, endDate),
    };
    if (photographerId) {
      whereClause.photographerId = photographerId;
    }

    const [reservations, total] = await this.reservationRepository.findAndCount(
      {
        where: whereClause,
        relations: {
          customer: true,
        },
        order: {
          date: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    const rawBookings = reservations.map((res) => ({
      id: res.id,
      clientName: `${res.customer.firstName} ${res.customer.lastName}`,
      date: res.date,
      eventType: res.eventType,
      totalLkr: (res.totalAmountInCents || 0) / 100,
      status: res.status,
    }));

    return {
      data: rawBookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async generateFinancialReportPdf(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ): Promise<any> {
    const data = await this.generateReportData(
      photographerId,
      period,
      customStartDate,
      customEndDate,
    );
    return buildFinancialReportPdf(data, period);
  }

  async generateBookingsReportPdf(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ): Promise<any> {
    const data = await this.generateReportData(
      photographerId,
      period,
      customStartDate,
      customEndDate,
    );
    return buildBookingsReportPdf(data, period);
  }

  async generateLocationReportPdf(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ): Promise<any> {
    const data = await this.generateReportData(
      photographerId,
      period,
      customStartDate,
      customEndDate,
    );
    return buildLocationReportPdf(data, period);
  }

  async getPhotographerLeaderboard(
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    search?: string,
    customStartDate?: string,
    customEndDate?: string,
  ) {
    return this.aggregationService.getPhotographerLeaderboard(
      period,
      page,
      limit,
      search,
      customStartDate,
      customEndDate,
    );
  }
}
