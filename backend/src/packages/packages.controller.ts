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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PHOTOGRAPHER)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.packagesService.findAll(req.user.userId);
  }

  @Post()
  create(@Body() dto: CreatePackageDto, @Req() req: RequestWithUser) {
    return this.packagesService.create(dto, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePackageDto,
    @Req() req: RequestWithUser,
  ) {
    return this.packagesService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.packagesService.remove(id, req.user.userId);
  }
}
