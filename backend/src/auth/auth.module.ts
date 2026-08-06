import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthPasswordResetService } from './services/auth-password-reset.service';
import { AuthRegisterService } from './services/auth-register.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';

import { CustomerAuthService } from './services/customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { EmailModule } from '../email/email.module';

import { SmsDevService } from './services/sms-dev.service';
import { OtpService } from './services/otp.service';

import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    EmailModule,
    ReservationsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'SUPER_SECRET_KEY_CHANGE_ME',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    AuthService,
    AuthLoginService,
    AuthPasswordResetService,
    AuthRegisterService,
    CustomerAuthService,
    SmsDevService,
    OtpService,
    JwtStrategy,
  ],
  controllers: [AuthController, CustomerAuthController],
  exports: [
    AuthService,
    AuthLoginService,
    AuthPasswordResetService,
    AuthRegisterService,
    CustomerAuthService,
    SmsDevService,
    OtpService,
  ],
})
export class AuthModule {}
