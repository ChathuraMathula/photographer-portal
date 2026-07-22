import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { buildFinancialReportPdf, buildBookingsReportPdf, buildLocationReportPdf } from '../pdf/reports-pdf-builder';
import { getDateRange } from '../aggregators/date-range.util';
import { ReportsAggregationService } from './reports-aggregation.service';

@Injectable()
export class ReportsExportService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly aggregationService: ReportsAggregationService,
  ) {}

  async getReportBookings(
    photoId: string | undefined,
    period: any,
    page: number,
    limit: number,
    start?: string,
    end?: string,
  ) {
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
    const reportData = await this.aggregationService.generateReportData(photoId, period, start, end);
    return buildFinancialReportPdf(reportData, period);
  }

  async generateBookingsReportPdf(photoId: any, period: any, start?: string, end?: string) {
    const reportData = await this.aggregationService.generateReportData(photoId, period, start, end);
    return buildBookingsReportPdf(reportData, period);
  }

  async generateLocationReportPdf(photoId: any, period: any, start?: string, end?: string) {
    const reportData = await this.aggregationService.generateReportData(photoId, period, start, end);
    return buildLocationReportPdf(reportData, period);
  }
}
