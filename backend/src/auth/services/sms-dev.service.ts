import { Injectable, Logger } from '@nestjs/common';

export interface DevSmsMessage {
  id: string;
  phone: string;
  message: string;
  otp?: string;
  createdAt: Date;
}

@Injectable()
export class SmsDevService {
  private readonly logger = new Logger(SmsDevService.name);
  private messagesInbox: DevSmsMessage[] = [];

  async sendSms(phone: string, message: string, otp?: string): Promise<DevSmsMessage> {
    const devMessage: DevSmsMessage = {
      id: Math.random().toString(36).substring(2, 9),
      phone,
      message,
      otp,
      createdAt: new Date(),
    };

    this.messagesInbox.unshift(devMessage);
    // Keep only last 50 SMS messages in dev memory
    if (this.messagesInbox.length > 50) {
      this.messagesInbox.pop();
    }

    this.logger.log(`[SMS DEV DISPATCHED] To: ${phone} | Message: ${message}`);
    return devMessage;
  }

  getInbox(): DevSmsMessage[] {
    return this.messagesInbox;
  }

  clearInbox(): void {
    this.messagesInbox = [];
  }
}
