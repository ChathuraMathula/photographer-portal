import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPhotographerDto } from './dto/register-photographer.dto';
import { RegisterStudioDto } from './dto/register-studio.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, user } = await this.authService.login(loginDto);

    const isHttps = process.env.FRONTEND_URL?.startsWith('https://') ?? false;

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Logged in successfully',
      user: user,
    };
  }

  @Post('register/photographer')
  @HttpCode(HttpStatus.CREATED)
  async registerPhotographer(@Body() dto: RegisterPhotographerDto) {
    return this.authService.registerPhotographer(dto);
  }

  @Post('register/studio')
  @HttpCode(HttpStatus.CREATED)
  async registerStudio(@Body() dto: RegisterStudioDto) {
    return this.authService.registerStudio(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return {
      message: 'Logged out successfully',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Get('check-availability')
  async checkAvailability(
    @Query('email') email?: string,
    @Query('username') username?: string,
    @Query('bookingSlug') bookingSlug?: string,
  ) {
    return this.authService.checkAvailability({ email, username, bookingSlug });
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(
    @Body('target') target: string,
    @Body('type') type: 'EMAIL' | 'SMS',
  ) {
    return this.authService.sendOtp(target, type);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('target') target: string,
    @Body('otp') otp: string,
    @Body('type') type: 'EMAIL' | 'SMS',
  ) {
    return this.authService.verifyOtp(target, otp, type);
  }

  @Get('sms-inbox')
  async getSmsDevInbox() {
    return this.authService.getSmsDevInbox();
  }

  @Post('sms-inbox/clear')
  @HttpCode(HttpStatus.OK)
  async clearSmsDevInbox() {
    return this.authService.clearSmsDevInbox();
  }
}
