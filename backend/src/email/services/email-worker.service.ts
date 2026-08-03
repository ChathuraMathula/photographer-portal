import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailWorkerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST || 'maildev';
    const port = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || '1025', 10);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      ignoreTLS: true,
    });
  }

  async sendBookingReceived(
    customerEmail: string,
    customerName: string,
    trackingLink: string,
  ) {
    const html = `
      <h2>Reservation Request Received</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for submitting a reservation request. The photographer has been notified and will review your request shortly.</p>
      <p>You can track the status of your reservation, select packages, and message the photographer by clicking the link below:</p>
      <p><a href="${trackingLink}">${trackingLink}</a></p>
      <p><em>Note: For security reasons, you will be prompted to verify your email when you open this link.</em></p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: customerEmail,
      subject: 'Reservation Request Submitted - Pending Review',
      html,
    });
  }

  async sendQuotationProposed(
    customerEmail: string,
    customerName: string,
    trackingLink: string,
    advancePaymentAmount: number,
    notes?: string,
  ) {
    const html = `
      <h2>Quotation and Packages Proposed</h2>
      <p>Dear ${customerName},</p>
      <p>The photographer has reviewed your booking request and sent over recommended package options and price details.</p>
      ${notes ? `<p><strong>Photographer's Note:</strong> ${notes}</p>` : ''}
      <p>Please visit the tracking page below to select your package, view instructions, and confirm the reservation:</p>
      <p><a href="${trackingLink}">${trackingLink}</a></p>
      <p style="color: red; font-weight: bold;">⚠️ IMPORTANT: This slot is locked for 24 hours. You must select a package and confirm the booking within 24 hours, or this request will expire and the date will be made available to other clients.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: customerEmail,
      subject: 'Packages Proposed - Action Required within 24 Hours',
      html,
    });
  }

  async sendReservationRejected(
    customerEmail: string,
    customerName: string,
    reason: string,
  ) {
    const html = `
      <h2>Reservation Request Update</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for your interest in booking our services.</p>
      <p>Unfortunately, the photographer is unable to accept your reservation request at this time. Here is their message:</p>
      <blockquote>${reason}</blockquote>
      <p>We wish you all the best for your event and hope to work with you in the future.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: customerEmail,
      subject: 'Update on your Reservation Request',
      html,
    });
  }

  async sendReservationConfirmed(
    photographerEmail: string,
    photographerName: string,
    customerName: string,
    eventDate: string,
    packageName: string,
  ) {
    const html = `
      <h2>Reservation Confirmed!</h2>
      <p>Dear ${photographerName},</p>
      <p>Good news! Your customer <strong>${customerName}</strong> has accepted your proposal and confirmed their booking for <strong>${eventDate}</strong>.</p>
      <p><strong>Selected Package:</strong> ${packageName}</p>
      <p>Please log in to your dashboard to view the full details and manage the schedule.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: photographerEmail,
      subject: `Booking Confirmed for ${eventDate}`,
      html,
    });
  }

  async sendInvoice(
    customerEmail: string,
    customerName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer,
    invoiceUrl?: string,
  ) {
    const html = `
      <h2>Invoice & Receipt</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for your payment! Please find attached the official PDF invoice for your reservation.</p>
      <p>Invoice Number: <strong>${invoiceNumber}</strong></p>
      ${invoiceUrl
        ? `<p>You can also view or download your invoice PDF online by clicking the link below:</p>
             <p><a href="${invoiceUrl}" target="_blank" rel="noopener noreferrer">${invoiceUrl}</a></p>`
        : ''
      }
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: customerEmail,
      subject: `Invoice #${invoiceNumber} - Photographer Portal`,
      html,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }

  async sendAccountDeactivated(userEmail: string, firstName: string) {
    const html = `
      <h2>Account Deactivated</h2>
      <p>Dear ${firstName},</p>
      <p>Your account on Photographer Portal has been deactivated by an administrator.</p>
      <p>If you believe this is an error, please contact support.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: userEmail,
      subject: 'Account Status Notice',
      html,
    });
  }

  async sendResetPasswordEmail(
    userEmail: string,
    firstName: string,
    resetLink: string,
  ) {
    const html = `
      <h2>Password Reset Request</h2>
      <p>Dear ${firstName},</p>
      <p>You requested a password reset for your Photographer Portal account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: userEmail,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendPaymentReminder(
    customerEmail: string,
    customerName: string,
    trackingLink: string,
    packageName: string,
    advancePaymentAmount: number,
  ) {
    const html = `
      <h2>Payment Reminder</h2>
      <p>Dear ${customerName},</p>
      <p>This is a friendly reminder that your booking reservation for <strong>${packageName}</strong> requires a deposit payment to confirm.</p>
      <p><strong>Advance Deposit:</strong> LKR ${(advancePaymentAmount / 100).toLocaleString()}</p>
      <p>Please complete your payment here:</p>
      <p><a href="${trackingLink}">${trackingLink}</a></p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: customerEmail,
      subject: 'Payment Reminder for Reservation',
      html,
    });
  }

  async sendUpcomingBookingReminder(
    email: string,
    name: string,
    recipientType: 'photographer' | 'customer',
    otherPartyName: string,
    eventDate: string,
  ) {
    const html = `
      <h2>Upcoming Booking Reminder</h2>
      <p>Dear ${name},</p>
      <p>This is a reminder for your upcoming photo session scheduled on <strong>${eventDate}</strong> with <strong>${otherPartyName}</strong>.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: email,
      subject: `Reminder: Upcoming Booking on ${eventDate}`,
      html,
    });
  }

  async sendUserCreated(
    userEmail: string,
    firstName: string,
    role: string,
    password?: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    const html = `
      <h2>Welcome to Photographer Portal</h2>
      <p>Dear ${firstName},</p>
      <p>An administrator has created an account for you on the Photographer Portal.</p>
      <p><strong>Account Role:</strong> ${role}</p>
      <p><strong>Login Email:</strong> ${userEmail}</p>
      ${password ? `<p><strong>Temporary Password:</strong> <code>${password}</code></p>` : ''}
      <p>You can access your portal here:</p>
      <p><a href="${frontendUrl}/login">${frontendUrl}/login</a></p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: userEmail,
      subject: 'Account Created - Photographer Portal',
      html,
    });
  }

  async sendUserDetailsUpdated(userEmail: string, firstName: string) {
    const html = `
      <h2>Account Information Updated</h2>
      <p>Dear ${firstName},</p>
      <p>This is to inform you that your profile details (such as name or booking slug) have been updated by an administrator.</p>
      <p>If you have any questions, please contact system administration.</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: userEmail,
      subject: 'Account Details Updated - Photographer Portal',
      html,
    });
  }
}
