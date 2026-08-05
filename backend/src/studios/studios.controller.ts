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
import { StudiosService } from './studios.service';
import { CreateStudioPhotographerDto } from './dto/create-studio-photographer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Get('public')
  async findPublicPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.studiosService.findPublicPaginated({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  @Get('public/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.studiosService.findBySlug(slug);
  }

  @Get('my/photographers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDIO)
  async getStudioPhotographers(@Req() req: RequestWithUser) {
    return this.studiosService.getStudioPhotographers(req.user.userId);
  }

  @Post('my/photographers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDIO)
  async createStudioPhotographer(
    @Req() req: RequestWithUser,
    @Body() dto: CreateStudioPhotographerDto,
  ) {
    return this.studiosService.createStudioPhotographer(req.user.userId, dto);
  }

  @Patch('my/reservations/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDIO)
  async assignReservationToStaff(
    @Req() req: RequestWithUser,
    @Param('id') reservationId: string,
    @Body('assignedPhotographerId') assignedPhotographerId: string | null,
  ) {
    return this.studiosService.assignReservationToStaff(
      req.user.userId,
      reservationId,
      assignedPhotographerId,
    );
  }
}
