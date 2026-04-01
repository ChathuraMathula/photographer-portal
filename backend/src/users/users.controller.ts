import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Post('create-admin')
  @Roles(UserRole.SUPER_ADMIN)
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return {
      message: 'Admin creation authorized.',
      dataReceived: createUserDto.email,
    };
  }

  @Post('create-photographer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createPhotographer(@Body() createUserDto: CreateUserDto) {
    return {
      message: 'Photographer creation authorized.',
      dataReceived: createUserDto.email,
    };
  }
}
