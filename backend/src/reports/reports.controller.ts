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
    @Query('period') period: 'weekly' | 'monthly' | 'yearly',
  ) {
    return this.reportsService.generateReportData(req.user.userId, period);
  }

  @Get('pdf')
  async downloadReportPdf(
    @Req() req: RequestWithUser,
    @Query('period') period: 'weekly' | 'monthly' | 'yearly',
    @Res() res: express.Response,
  ) {
    const pdfDoc = await this.reportsService.generateReportPdf(req.user.userId, period);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=photographer_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  }
}
