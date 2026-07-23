import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EmailService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) { }

  async sendBookingReceived(
    customerEmail: string,
    customerName: string,
    trackingLink: string,
  ) {
    this.client.emit('email.sendBookingReceived', {
      customerEmail,
      customerName,
      trackingLink,
    });
  }

  async sendQuotationProposed(
    customerEmail: string,
    customerName: string,
    trackingLink: string,
    advancePaymentAmount: number,
    notes?: string,
  ) {
    this.client.emit('email.sendQuotationProposed', {
      customerEmail,
      customerName,
      trackingLink,
      advancePaymentAmount,
      notes,
    });
  }

  async sendReservationRejected(
    customerEmail: string,
    customerName: string,
    reason: string,
  ) {
    this.client.emit('email.sendReservationRejected', {
      customerEmail,
      customerName,
      reason,
    });
  }

  async sendReservationConfirmed(
    photographerEmail: string,
    photographerName: string,
    customerName: string,
    eventDate: string,
    packageName: string,
  ) {
    this.client.emit('email.sendReservationConfirmed', {
      photographerEmail,
      photographerName,
      customerName,
      eventDate,
      packageName,
    });
  }

  async sendInvoice(
    customerEmail: string,
    customerName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer,
  ) {
    this.client.emit('email.sendInvoice', {
      customerEmail,
      customerName,
      invoiceNumber,
      pdfBuffer,
    });
  }

  async sendAccountDeactivated(userEmail: string, firstName: string) {
    this.client.emit('email.sendAccountDeactivated', {
      userEmail,
      firstName,
    });
  }

  async sendResetPasswordEmail(
    userEmail: string,
    firstName: string,
    resetLink: string,
  ) {
    this.client.emit('email.sendResetPasswordEmail', {
      userEmail,
      firstName,
      resetLink,
    });
  }

  async sendPaymentReminder(
    customerEmail: string,
    customerName: string,
    trackingLink: string,
    packageName: string,
    advancePaymentAmount: number,
  ) {
    this.client.emit('email.sendPaymentReminder', {
      customerEmail,
      customerName,
      trackingLink,
      packageName,
      advancePaymentAmount,
    });
  }

  async sendUpcomingBookingReminder(
    email: string,
    name: string,
    recipientType: 'photographer' | 'customer',
    otherPartyName: string,
    eventDate: string,
  ) {
    this.client.emit('email.sendUpcomingBookingReminder', {
      email,
      name,
      recipientType,
      otherPartyName,
      eventDate,
    });
  }

  async sendUserCreated(
    userEmail: string,
    firstName: string,
    role: string,
    password?: string,
  ) {
    this.client.emit('email.sendUserCreated', {
      userEmail,
      firstName,
      role,
      password,
    });
  }

  async sendUserDetailsUpdated(userEmail: string, firstName: string) {
    this.client.emit('email.sendUserDetailsUpdated', {
      userEmail,
      firstName,
    });
  }
}
