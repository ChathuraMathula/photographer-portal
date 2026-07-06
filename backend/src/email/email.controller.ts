import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailWorkerService } from './email-worker.service';

@Controller()
export class EmailController {
  constructor(private readonly emailWorkerService: EmailWorkerService) {}

  @EventPattern('email.sendBookingReceived')
  async handleSendBookingReceived(@Payload() data: any) {
    await this.emailWorkerService.sendBookingReceived(
      data.customerEmail,
      data.customerName,
      data.trackingLink,
    );
  }

  @EventPattern('email.sendQuotationProposed')
  async handleSendQuotationProposed(@Payload() data: any) {
    await this.emailWorkerService.sendQuotationProposed(
      data.customerEmail,
      data.customerName,
      data.trackingLink,
      data.advancePaymentAmount,
      data.notes,
    );
  }

  @EventPattern('email.sendReservationRejected')
  async handleSendReservationRejected(@Payload() data: any) {
    await this.emailWorkerService.sendReservationRejected(
      data.customerEmail,
      data.customerName,
      data.reason,
    );
  }

  @EventPattern('email.sendReservationConfirmed')
  async handleSendReservationConfirmed(@Payload() data: any) {
    await this.emailWorkerService.sendReservationConfirmed(
      data.photographerEmail,
      data.photographerName,
      data.customerName,
      data.eventDate,
      data.packageName,
    );
  }

  @EventPattern('email.sendInvoice')
  async handleSendInvoice(@Payload() data: any) {
    // Reconstruct buffer if it was serialized over RMQ as an object { type: 'Buffer', data: [...] }
    let pdfBuffer = data.pdfBuffer;
    if (pdfBuffer && pdfBuffer.type === 'Buffer' && Array.isArray(pdfBuffer.data)) {
      pdfBuffer = Buffer.from(pdfBuffer.data);
    }

    await this.emailWorkerService.sendInvoice(
      data.customerEmail,
      data.customerName,
      data.invoiceNumber,
      pdfBuffer,
    );
  }

  @EventPattern('email.sendAccountDeactivated')
  async handleSendAccountDeactivated(@Payload() data: any) {
    await this.emailWorkerService.sendAccountDeactivated(
      data.userEmail,
      data.firstName,
    );
  }

  @EventPattern('email.sendResetPasswordEmail')
  async handleSendResetPasswordEmail(@Payload() data: any) {
    await this.emailWorkerService.sendResetPasswordEmail(
      data.userEmail,
      data.firstName,
      data.resetLink,
    );
  }

  @EventPattern('email.sendPaymentReminder')
  async handleSendPaymentReminder(@Payload() data: any) {
    await this.emailWorkerService.sendPaymentReminder(
      data.customerEmail,
      data.customerName,
      data.trackingLink,
      data.packageName,
      data.advancePaymentAmount,
    );
  }

  @EventPattern('email.sendUpcomingBookingReminder')
  async handleSendUpcomingBookingReminder(@Payload() data: any) {
    await this.emailWorkerService.sendUpcomingBookingReminder(
      data.email,
      data.name,
      data.recipientType,
      data.otherPartyName,
      data.eventDate,
    );
  }
}
