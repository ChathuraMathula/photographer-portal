import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { PhotographersService } from './photographers.service';

@Controller('photographers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhotographersController {
  constructor(private readonly photographersService: PhotographersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.photographersService.findAll();
  }

  // Photographer can view/edit their own profile; admin can view any
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  findOne(@Param('id') id: string) {
    return this.photographersService.findOne(id);
  }

  @Patch(':id/profile')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  updateProfile(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.photographersService.updateProfile(id, body as any);
  }

  @Get(':id/booking-link')
  @Roles(UserRole.SUPER_ADMIN)
  getBookingLink(@Param('id') id: string, @Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.photographersService.getBookingLink(id, baseUrl);
  }

  @Patch(':id/toggle-availability')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  toggleAvailability(@Param('id') id: string) {
    return this.photographersService.toggleAvailability(id);
  }
}
