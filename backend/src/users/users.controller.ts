import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { UsersService } from './users.service';
import { CreatePhotographerDto } from './dto/create-photographer.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('photographers')
  createPhotographer(
    @Body() dto: CreatePhotographerDto,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.usersService.createPhotographer(dto, baseUrl);
  }

  @Get('photographers')
  listPhotographers() {
    return this.usersService.listPhotographers();
  }
}
