import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PhotographersService } from './photographers.service';
import { UpdatePhotographerProfileDto } from './dto/update-photographer-profile.dto';

@Controller('photographers')
export class PhotographersController {
  constructor(private readonly photographersService: PhotographersService) {}

  // Public paginated endpoint for dynamic scroll loading
  @Get('public')
  findPublicPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 6;
    return this.photographersService.findPublicPaginated(
      pageNum,
      limitNum,
      search,
    );
  }

  // Public endpoint to rate a photographer
  @Post(':id/rate')
  submitRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
  ) {
    const numRating = Number(rating) || 5;
    return this.photographersService.submitRating(id, numRating);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.photographersService.findAll();
  }

  // Photographer can view/edit their own profile; admin can view any
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  findOne(@Param('id') id: string) {
    return this.photographersService.findOne(id);
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  updateProfile(
    @Param('id') id: string,
    @Body() body: UpdatePhotographerProfileDto,
  ) {
    return this.photographersService.updateProfile(id, body);
  }

  @Get(':id/booking-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getBookingLink(@Param('id') id: string, @Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.photographersService.getBookingLink(id, baseUrl);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHOTOGRAPHER)
  toggleAvailability(@Param('id') id: string) {
    return this.photographersService.toggleAvailability(id);
  }
}
