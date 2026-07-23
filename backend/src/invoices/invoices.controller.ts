import {
  Body,
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';
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
  async getInvoices(
    @Req() req: RequestWithUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('filterDate') filterDate?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.invoicesService.getInvoices(
      req.user.userId,
      pageNum,
      limitNum,
      search,
      sortBy,
      sortOrder,
      filterDate,
    );
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
  async updateSettings(@Req() req: RequestWithUser, @Body() body: any) {
    return this.invoicesService.updateSettings(req.user.userId, body);
  }

  @Get('pdf/:filename')
  async getInvoicePdfFile(
    @Param('filename') filename: string,
    @Res() res: express.Response,
  ) {
    const filePath = join(process.cwd(), 'uploads', 'invoices', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Invoice file not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  }

  @Get(':reservationId/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async downloadInvoice(
    @Param('reservationId') reservationId: string,
    @Req() req: RequestWithUser,
    @Res() res: express.Response,
  ) {
    const { pdfBuffer, fileName } =
      await this.invoicesService.getOrCreateInvoicePdf(
        reservationId,
        req.user.userId,
      );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(pdfBuffer);
  }

  @Get('public/:token/download')
  async downloadInvoicePublic(
    @Param('token') token: string,
    @Res() res: express.Response,
  ) {
    const { pdfBuffer, fileName } =
      await this.invoicesService.getOrCreateInvoicePdfByToken(token);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(pdfBuffer);
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
