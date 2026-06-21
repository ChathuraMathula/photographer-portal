import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: RequestWithUser) {
    const callerRole = req.user.role;
    return this.usersService.create(dto, callerRole);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const callerRole = req.user.role;
    return this.usersService.findAll(callerRole);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @Req() req: RequestWithUser) {
    const callerRole = req.user.role;
    return this.usersService.toggleActive(id, callerRole);
  }
}
