import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { buildFinancialReportPdf, buildBookingsReportPdf, buildLocationReportPdf } from './reports-pdf-builder';
import { ReportsAggregationService } from './reports-aggregation.service';
import { getDateRange } from './database/date-range.util';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly aggregationService: ReportsAggregationService,
  ) {}

  async generateReportData(photoId: string | undefined, period: any, start?: string, end?: string) {
    return this.aggregationService.generateReportData(photoId, period, start, end);
  }

  async getReportBookings(photoId: string | undefined, period: any, page: number, limit: number, start?: string, end?: string) {
    const { startDate, endDate } = getDateRange(period, start, end);
    const where: any = { date: Between(startDate, endDate) };
    if (photoId) where.photographerId = photoId;

    const [reservations, total] = await this.reservationRepository.findAndCount({
      where,
      relations: { customer: true },
      order: { date: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = reservations.map((res) => ({
      id: res.id,
      clientName: `${res.customer.firstName} ${res.customer.lastName}`,
      date: res.date,
      eventType: res.eventType,
      totalLkr: (res.totalAmountInCents || 0) / 100,
      status: res.status,
    }));

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async generateFinancialReportPdf(photoId: any, period: any, start?: string, end?: string) {
    return buildFinancialReportPdf(await this.generateReportData(photoId, period, start, end), period);
  }

  async generateBookingsReportPdf(photoId: any, period: any, start?: string, end?: string) {
    return buildBookingsReportPdf(await this.generateReportData(photoId, period, start, end), period);
  }

  async generateLocationReportPdf(photoId: any, period: any, start?: string, end?: string) {
    return buildLocationReportPdf(await this.generateReportData(photoId, period, start, end), period);
  }

  async getPhotographerLeaderboard(period: any, page: number, limit: number, search?: string, start?: string, end?: string) {
    return this.aggregationService.getPhotographerLeaderboard(period, page, limit, search, start, end);
  }
}
