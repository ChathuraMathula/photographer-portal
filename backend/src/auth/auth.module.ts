import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthPasswordResetService } from './services/auth-password-reset.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database/database.module';

import { CustomerAuthService } from './services/customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    DatabaseModule, // Gives us access to User and Customer repositories
    EmailModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'SUPER_SECRET_KEY_CHANGE_ME',
      signOptions: { expiresIn: '1d' }, // Token valid for 24 hours
    }),
  ],
  providers: [
    AuthService,
    AuthLoginService,
    AuthPasswordResetService,
    CustomerAuthService,
    JwtStrategy,
  ],
  controllers: [AuthController, CustomerAuthController],
  exports: [
    AuthService,
    AuthLoginService,
    AuthPasswordResetService,
    CustomerAuthService,
  ],
})
export class AuthModule {}
