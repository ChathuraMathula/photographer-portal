import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { SmsDevService } from './sms-dev.service';

interface OtpRecord {
  target: string;
  otp: string;
  type: 'EMAIL' | 'SMS';
  expiresAt: Date;
  isVerified: boolean;
}

@Injectable()
export class OtpService {
  private otpStore: Map<string, OtpRecord> = new Map();

  constructor(
    private readonly emailService: EmailService,
    private readonly smsDevService: SmsDevService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(target: string, type: 'EMAIL' | 'SMS') {
    const cleanTarget = target.trim().toLowerCase();
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const record: OtpRecord = {
      target: cleanTarget,
      otp: code,
      type,
      expiresAt,
      isVerified: false,
    };

    const key = `${type}:${cleanTarget}`;
    this.otpStore.set(key, record);

    if (type === 'EMAIL') {
      try {
        await this.emailService.sendUserCreated(
          cleanTarget,
          'Valued User',
          'VERIFICATION',
          code,
        );
      } catch (emailErr) {
        // Log RabbitMQ dispatch error safely without failing HTTP response
        console.error('RabbitMQ Email OTP dispatch log:', emailErr);
      }
    } else {
      await this.smsDevService.sendSms(
        cleanTarget,
        `Your SeyaRoo SMS verification OTP code is: ${code}. Valid for 10 minutes.`,
        code,
      );
    }

    return {
      message: `OTP verification code dispatched to ${type === 'EMAIL' ? 'email' : 'phone number'}.`,
      target: cleanTarget,
      type,
      // Expose OTP in dev response for ease of testing
      devOtp: code,
    };
  }

  verifyOtp(target: string, otp: string, type: 'EMAIL' | 'SMS') {
    const cleanTarget = target.trim().toLowerCase();
    const key = `${type}:${cleanTarget}`;
    const record = this.otpStore.get(key);

    if (!record) {
      throw new BadRequestException('No verification OTP request found. Please request a new code.');
    }

    if (new Date() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('Verification OTP code has expired. Please request a new code.');
    }

    if (record.otp !== otp.trim()) {
      throw new BadRequestException('Invalid OTP code. Please check your code and try again.');
    }

    record.isVerified = true;
    this.otpStore.set(key, record);

    return {
      success: true,
      message: `${type === 'EMAIL' ? 'Email' : 'Phone number'} verified successfully!`,
      target: cleanTarget,
    };
  }
}
