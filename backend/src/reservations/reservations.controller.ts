import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ReservationStatus } from '../entities/reservation.entity';
import { ReservationsService } from './reservations.service';
import type { Request } from 'express';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ProposeQuotationDto } from './dto/propose-quotation.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
  };
}

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHOTOGRAPHER)
  findAll(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.reservationsService.findAll(req.user, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    });
  }

  @Post()
  @Roles(UserRole.PHOTOGRAPHER)
  createManual(
    @Body() dto: CreateManualBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.createManualBooking(dto, req.user);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHOTOGRAPHER)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reservationsService.findOne(id, req.user);
  }

  @Post(':id/propose')
  @Roles(UserRole.PHOTOGRAPHER)
  proposeQuotation(
    @Param('id') id: string,
    @Body() dto: ProposeQuotationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.proposeQuotation(id, dto, req.user);
  }

  @Post(':id/reject')
  @Roles(UserRole.PHOTOGRAPHER)
  reject(
    @Param('id') id: string,
    @Body() dto: RejectReservationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.rejectReservation(id, dto, req.user);
  }

  @Get(':id/messages')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHOTOGRAPHER)
  getMessages(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reservationsService.getMessages(id, req.user);
  }

  @Post(':id/messages')
  @Roles(UserRole.PHOTOGRAPHER)
  sendMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.sendMessage(id, content, req.user);
  }
}
