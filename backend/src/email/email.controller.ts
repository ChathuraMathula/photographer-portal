import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EmailWorkerService } from './services/email-worker.service';

@Controller()
export class EmailController {
  constructor(private readonly emailWorkerService: EmailWorkerService) {}

  private async handleAck(context: RmqContext, action: () => Promise<void>) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await action();
      channel.ack(originalMsg);
    } catch (e) {
      console.error('Error processing email:', e);
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('email.sendBookingReceived')
  async handleSendBookingReceived(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendBookingReceived(
        data.customerEmail,
        data.customerName,
        data.trackingLink,
      );
    });
  }

  @EventPattern('email.sendQuotationProposed')
  async handleSendQuotationProposed(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendQuotationProposed(
        data.customerEmail,
        data.customerName,
        data.trackingLink,
        data.advancePaymentAmount,
        data.notes,
      );
    });
  }

  @EventPattern('email.sendReservationRejected')
  async handleSendReservationRejected(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendReservationRejected(
        data.customerEmail,
        data.customerName,
        data.reason,
      );
    });
  }

  @EventPattern('email.sendReservationConfirmed')
  async handleSendReservationConfirmed(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendReservationConfirmed(
        data.photographerEmail,
        data.photographerName,
        data.customerName,
        data.eventDate,
        data.packageName,
      );
    });
  }

  @EventPattern('email.sendInvoice')
  async handleSendInvoice(@Payload() data: any, @Ctx() context: RmqContext) {
    await this.handleAck(context, async () => {
      let pdfBuffer = data.pdfBuffer;
      if (
        pdfBuffer &&
        pdfBuffer.type === 'Buffer' &&
        Array.isArray(pdfBuffer.data)
      ) {
        pdfBuffer = Buffer.from(pdfBuffer.data);
      }
      await this.emailWorkerService.sendInvoice(
        data.customerEmail,
        data.customerName,
        data.invoiceNumber,
        pdfBuffer,
      );
    });
  }

  @EventPattern('email.sendAccountDeactivated')
  async handleSendAccountDeactivated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendAccountDeactivated(
        data.userEmail,
        data.firstName,
      );
    });
  }

  @EventPattern('email.sendResetPasswordEmail')
  async handleSendResetPasswordEmail(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendResetPasswordEmail(
        data.userEmail,
        data.firstName,
        data.resetLink,
      );
    });
  }

  @EventPattern('email.sendPaymentReminder')
  async handleSendPaymentReminder(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendPaymentReminder(
        data.customerEmail,
        data.customerName,
        data.trackingLink,
        data.packageName,
        data.advancePaymentAmount,
      );
    });
  }

  @EventPattern('email.sendUpcomingBookingReminder')
  async handleSendUpcomingBookingReminder(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendUpcomingBookingReminder(
        data.email,
        data.name,
        data.recipientType,
        data.otherPartyName,
        data.eventDate,
      );
    });
  }

  @EventPattern('email.sendUserCreated')
  async handleSendUserCreated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendUserCreated(
        data.userEmail,
        data.firstName,
        data.role,
        data.password,
      );
    });
  }

  @EventPattern('email.sendUserDetailsUpdated')
  async handleSendUserDetailsUpdated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    await this.handleAck(context, async () => {
      await this.emailWorkerService.sendUserDetailsUpdated(
        data.userEmail,
        data.firstName,
      );
    });
  }
}
