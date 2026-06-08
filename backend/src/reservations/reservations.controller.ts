import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { ReservationStatus } from '../schemas/reservation.schema';
import { ReservationsService } from './reservations.service';
import type { Request } from 'express';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.reservationsService.findAll(req.user as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.reservationsService.findOne(id, req.user as any);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReservationStatus,
    @Req() req: Request,
  ) {
    return this.reservationsService.updateStatus(id, status, req.user as any);
  }

  @Patch(':id/notes')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  addNote(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: Request,
  ) {
    return this.reservationsService.addAdminNote(id, note, req.user as any);
  }
}
