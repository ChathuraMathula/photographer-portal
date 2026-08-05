import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterPhotographerDto } from './dto/register-photographer.dto';
import { RegisterStudioDto } from './dto/register-studio.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthPasswordResetService } from './services/auth-password-reset.service';
import { AuthRegisterService } from './services/auth-register.service';

import { OtpService } from './services/otp.service';
import { SmsDevService } from './services/sms-dev.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginService: AuthLoginService,
    private readonly passwordResetService: AuthPasswordResetService,
    private readonly registerService: AuthRegisterService,
    private readonly otpService: OtpService,
    private readonly smsDevService: SmsDevService,
  ) {}

  async login(loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }

  async registerPhotographer(dto: RegisterPhotographerDto) {
    return this.registerService.registerPhotographer(dto);
  }

  async registerStudio(dto: RegisterStudioDto) {
    return this.registerService.registerStudio(dto);
  }

  async forgotPassword(email: string) {
    return this.passwordResetService.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return this.passwordResetService.resetPassword(token, newPassword);
  }

  async checkAvailability(query: { email?: string; username?: string; bookingSlug?: string }) {
    return this.registerService.checkAvailability(query);
  }

  async sendOtp(target: string, type: 'EMAIL' | 'SMS') {
    return this.otpService.sendOtp(target, type);
  }

  verifyOtp(target: string, otp: string, type: 'EMAIL' | 'SMS') {
    return this.otpService.verifyOtp(target, otp, type);
  }

  getSmsDevInbox() {
    return this.smsDevService.getInbox();
  }

  clearSmsDevInbox() {
    this.smsDevService.clearInbox();
    return { message: 'SMS Dev inbox cleared' };
  }
}
