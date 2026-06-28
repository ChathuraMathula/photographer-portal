import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { InvoicesService } from './invoices.service';

interface RequestWithUser extends express.Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async getInvoices(@Req() req: RequestWithUser) {
    return this.invoicesService.getInvoices(req.user.userId);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async getSettings(@Req() req: RequestWithUser) {
    return this.invoicesService.getSettings(req.user.userId);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async updateSettings(
    @Req() req: RequestWithUser,
    @Body() body: any,
  ) {
    return this.invoicesService.updateSettings(req.user.userId, body);
  }

  @Get(':reservationId/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async downloadInvoice(
    @Param('reservationId') reservationId: string,
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
  ) {
    const pdfDoc = await this.invoicesService.generateInvoicePdfDoc(reservationId, req.user.userId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${reservationId.slice(0, 8)}.pdf`);
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Get('public/:token/download')
  async downloadInvoicePublic(
    @Param('token') token: string,
    @Res() res: express.Response,
  ) {
    const pdfDoc = await this.invoicesService.generateInvoicePdfDocByToken(token);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${token.slice(0, 8)}.pdf`);
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Post(':reservationId/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async resendInvoice(
    @Param('reservationId') reservationId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.invoicesService.resendInvoice(reservationId, req.user.userId);
  }
}
