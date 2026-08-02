import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerAuthService } from './services/customer-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller()
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('auth/customer/magic-link')
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body('email') email: string) {
    return this.customerAuthService.requestMagicLink(email);
  }

  @Post('auth/customer/verify-magic-link')
  @HttpCode(HttpStatus.OK)
  async verifyMagicLink(
    @Body('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerAuthService.verifyMagicLink(token);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Get('auth/customer/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.customerAuthService.getProfile(req.user.userId);
  }

  @Post('auth/customer/complete-profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @Req() req: any,
    @Body()
    dto: {
      firstName: string;
      lastName: string;
      phone: string;
      address?: string;
    },
  ) {
    return this.customerAuthService.completeProfile(req.user.userId, dto);
  }

  @Get('customer/reservations')
  @UseGuards(JwtAuthGuard)
  async getCustomerReservations(@Req() req: any) {
    return this.customerAuthService.getCustomerReservations(req.user.userId);
  }
}
