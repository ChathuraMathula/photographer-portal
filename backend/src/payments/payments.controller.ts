import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
  };
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  charge(@Body() dto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(dto);
  }

  @Post(':reservationId/manual-fulfill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  manualFulfill(
    @Param('reservationId') reservationId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.paymentsService.manualFulfillPayment(
      reservationId,
      req.user.userId,
    );
  }

  @Get('photographer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  getTransactions(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    return this.paymentsService.getPhotographerTransactions(req.user.userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
      method,
    });
  }

  @Get(':reservationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PHOTOGRAPHER)
  async getPaymentsByReservation(
    @Param('reservationId') reservationId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.paymentsService.getReservationPayments(
      reservationId,
      req.user.userId,
    );
  }
}
