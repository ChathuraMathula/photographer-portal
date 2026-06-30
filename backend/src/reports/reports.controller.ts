import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ReportsService } from './reports.service';

interface RequestWithUser extends express.Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PHOTOGRAPHER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getTargetPhotographerId(
    req: RequestWithUser,
    queryId?: string,
  ): string | undefined {
    // If photographer, they can only view their own data
    if (req.user.role === UserRole.PHOTOGRAPHER) {
      return req.user.userId;
    }
    // If admin/super_admin, they can specify a photographer ID, or leave undefined for system-wide
    return queryId || undefined;
  }

  @Get('data')
  async getReportData(
    @Req() req: RequestWithUser,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('photographerId') queryPhotographerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const targetId = this.getTargetPhotographerId(req, queryPhotographerId);
    return this.reportsService.generateReportData(
      targetId,
      period,
      startDate,
      endDate,
    );
  }

  @Get('bookings')
  async getReportBookings(
    @Req() req: RequestWithUser,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('photographerId') queryPhotographerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const targetId = this.getTargetPhotographerId(req, queryPhotographerId);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.reportsService.getReportBookings(
      targetId,
      period,
      pageNum,
      limitNum,
      startDate,
      endDate,
    );
  }

  @Get('pdf/financial')
  async downloadFinancialReportPdf(
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('photographerId') queryPhotographerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const targetId = this.getTargetPhotographerId(req, queryPhotographerId);
    const pdfDoc = await this.reportsService.generateFinancialReportPdf(
      targetId,
      period,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financial_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Get('pdf/bookings')
  async downloadBookingsReportPdf(
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('photographerId') queryPhotographerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const targetId = this.getTargetPhotographerId(req, queryPhotographerId);
    const pdfDoc = await this.reportsService.generateBookingsReportPdf(
      targetId,
      period,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=bookings_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Get('pdf/location')
  async downloadLocationReportPdf(
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('photographerId') queryPhotographerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const targetId = this.getTargetPhotographerId(req, queryPhotographerId);
    const pdfDoc = await this.reportsService.generateLocationReportPdf(
      targetId,
      period,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=location_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  }
}
