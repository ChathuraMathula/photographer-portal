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
@Roles(UserRole.PHOTOGRAPHER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('data')
  async getReportData(
    @Req() req: RequestWithUser,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.generateReportData(req.user.userId, period, startDate, endDate);
  }

  @Get('pdf/financial')
  async downloadFinancialReportPdf(
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pdfDoc = await this.reportsService.generateFinancialReportPdf(req.user.userId, period, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=photographer_financial_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Get('pdf/bookings')
  async downloadBookingsReportPdf(
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pdfDoc = await this.reportsService.generateBookingsReportPdf(req.user.userId, period, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=photographer_bookings_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  }
}
