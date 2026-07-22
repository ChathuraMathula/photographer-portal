import { Injectable } from '@nestjs/common';
import { ReportsAggregationService } from './services/reports-aggregation.service';
import { ReportsExportService } from './services/reports-export.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly aggregationService: ReportsAggregationService,
    private readonly exportService: ReportsExportService,
  ) {}

  async generateReportData(photoId: string | undefined, period: any, start?: string, end?: string) {
    return this.aggregationService.generateReportData(photoId, period, start, end);
  }

  async getReportBookings(photoId: string | undefined, period: any, page: number, limit: number, start?: string, end?: string) {
    return this.exportService.getReportBookings(photoId, period, page, limit, start, end);
  }

  async generateFinancialReportPdf(photoId: any, period: any, start?: string, end?: string) {
    return this.exportService.generateFinancialReportPdf(photoId, period, start, end);
  }

  async generateBookingsReportPdf(photoId: any, period: any, start?: string, end?: string) {
    return this.exportService.generateBookingsReportPdf(photoId, period, start, end);
  }

  async generateLocationReportPdf(photoId: any, period: any, start?: string, end?: string) {
    return this.exportService.generateLocationReportPdf(photoId, period, start, end);
  }

  async getPhotographerLeaderboard(period: any, page: number, limit: number, search?: string, start?: string, end?: string) {
    return this.aggregationService.getPhotographerLeaderboard(period, page, limit, search, start, end);
  }
}
