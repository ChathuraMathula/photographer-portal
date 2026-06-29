import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
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
      <p><strong>Advance Deposit Required:</strong> LKR ${(advancePaymentAmount / 100).toLocaleString()}</p>
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
      subject: 'Booking Confirmed - ' + customerName,
      html,
    });
  }

  async sendInvoice(
    customerEmail: string,
    customerName: string,
    invoiceNumber: string,
    pdfBuffer: Buffer,
  ) {
    const html = `
      <h2>Invoice Issued: ${invoiceNumber}</h2>
      <p>Dear ${customerName},</p>
      <p>Your payment has been successfully received, and your booking is fully settled. Please find your system-generated invoice attached to this email.</p>
      <p>Thank you for choosing our services!</p>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: customerEmail,
      subject: `Invoice - ${invoiceNumber}`,
      html,
      attachments: [
        {
          filename: `invoice_${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }

  async sendAccountDeactivated(
    userEmail: string,
    firstName: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Account Suspended</h2>
        <p>Dear ${firstName},</p>
        <p>We are writing to inform you that your account on the <strong>Photographer Portal</strong> has been <strong>suspended</strong> by a system administrator.</p>
        <p>As a result of this action:</p>
        <ul>
          <li>Your portal access has been immediately revoked.</li>
          <li>Any active sessions have been terminated.</li>
          <li>Your booking page is no longer accessible to clients.</li>
        </ul>
        <p>If you believe this is a mistake or would like to appeal this decision, please contact your system administrator directly.</p>
        <p style="color: #6b7280; font-size: 0.85em; margin-top: 24px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: '"Photographer Portal" <noreply@photoportal.com>',
      to: userEmail,
      subject: 'Your Account Has Been Suspended',
      html,
    });
  }
}
