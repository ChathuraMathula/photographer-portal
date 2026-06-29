import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private auditLogsService: AuditLogsService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    console.log(email, password);

    // 1. Find user by email
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate JWT Payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    await this.auditLogsService.logAction(
      'LOGIN_SUCCESS',
      `User ${user.email} logged in successfully`,
      user.id,
      user.email,
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user || !user.isActive) {
      // Return a success message even if email is not found to prevent user enumeration attacks
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    await this.userRepository.save(user);

    const origin = process.env.FRONTEND_URL ?? 'http://localhost:4000';
    const resetLink = `${origin}/reset-password?token=${token}`;

    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.firstName,
      resetLink,
    );

    await this.auditLogsService.logAction(
      'FORGOT_PASSWORD_REQUEST',
      `Password reset requested for ${user.email}`,
      user.id,
      user.email,
    );

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.userRepository.save(user);

    await this.auditLogsService.logAction(
      'PASSWORD_RESET_SUCCESS',
      `Password reset successfully completed for ${user.email}`,
      user.id,
      user.email,
    );

    return { message: 'Password has been reset successfully.' };
  }
}
