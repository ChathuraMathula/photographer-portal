import {
  Body,
  Controller,
  Delete,
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
import { LockedDatesService } from './locked-dates.service';
import type { Request } from 'express';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ProposeQuotationDto } from './dto/propose-quotation.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { CreateLockedDateDto } from './dto/create-locked-date.dto';

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
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly lockedDatesService: LockedDatesService,
  ) {}

  @Get('locked-dates')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  getLockedDates(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lockedDatesService.getLockedDates(
      req.user.userId,
      startDate,
      endDate,
    );
  }

  @Post('locked-dates')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  createLockedDate(
    @Req() req: RequestWithUser,
    @Body() dto: CreateLockedDateDto,
  ) {
    return this.lockedDatesService.createLockedDate(req.user.userId, dto);
  }

  @Delete('locked-dates/:id')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  deleteLockedDate(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.lockedDatesService.deleteLockedDate(req.user.userId, id);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PHOTOGRAPHER,
    UserRole.STUDIO,
    UserRole.STUDIO_PHOTOGRAPHER,
    UserRole.STUDIO_STAFF,
  )
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
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  createManual(
    @Body() dto: CreateManualBookingDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.createManualBooking(dto, req.user);
  }

  @Get('notifications/unread')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  getUnreadNotifications(@Req() req: RequestWithUser) {
    return this.reservationsService.getUnreadNotifications(req.user);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PHOTOGRAPHER,
    UserRole.STUDIO,
    UserRole.STUDIO_PHOTOGRAPHER,
    UserRole.STUDIO_STAFF,
  )
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reservationsService.findOne(id, req.user);
  }

  @Post(':id/propose')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  proposeQuotation(
    @Param('id') id: string,
    @Body() dto: ProposeQuotationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.proposeQuotation(id, dto, req.user);
  }

  @Post(':id/reject')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  reject(
    @Param('id') id: string,
    @Body() dto: RejectReservationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.rejectReservation(id, dto, req.user);
  }

  @Get(':id/messages')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PHOTOGRAPHER,
    UserRole.STUDIO,
    UserRole.STUDIO_PHOTOGRAPHER,
    UserRole.STUDIO_STAFF,
  )
  getMessages(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reservationsService.getMessages(id, req.user);
  }

  @Post(':id/messages')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  sendMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: RequestWithUser,
  ) {
    return this.reservationsService.sendMessage(id, content, req.user);
  }

  @Patch(':id/read')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  markReservationAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reservationsService.markReservationAsRead(id, req.user);
  }

  @Patch(':id/messages/read')
  @Roles(UserRole.PHOTOGRAPHER, UserRole.STUDIO, UserRole.STUDIO_PHOTOGRAPHER, UserRole.STUDIO_STAFF)
  markMessagesAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.reservationsService.markMessagesAsRead(id, req.user);
  }
}
