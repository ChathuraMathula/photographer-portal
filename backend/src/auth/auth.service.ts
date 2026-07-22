import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthPasswordResetService } from './services/auth-password-reset.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginService: AuthLoginService,
    private readonly passwordResetService: AuthPasswordResetService,
  ) {}

  async login(loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }

  async forgotPassword(email: string) {
    return this.passwordResetService.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return this.passwordResetService.resetPassword(token, newPassword);
  }
}
