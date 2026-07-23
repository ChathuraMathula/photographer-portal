import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentStatus, Payment } from '../../entities/payment.entity';
import { Reservation } from '../../entities/reservation.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { EmailService } from '../../email/email.service';
import { InvoiceGenerationService } from '../../invoices/services/invoice-generation.service';

@Injectable()
export class StripeHelperService {
  constructor(
    private readonly emailService: EmailService,
    private readonly invoiceGenerationService: InvoiceGenerationService,
  ) {}

  async simulateStripeCharge(
    cardNumber: string,
  ): Promise<{
    status: PaymentStatus;
    errorMsg?: string;
    resolvedCardBrand: string;
  }> {
    const normalizedCard = cardNumber.replace(/\s+/g, '');

    if (normalizedCard.length !== 16 || !/^\d+$/.test(normalizedCard)) {
      throw new BadRequestException('Card Declined: Invalid Card Format');
    }

    let status = PaymentStatus.SUCCESS;
    let errorMsg: string | undefined;

    if (normalizedCard === '4000000000000002') {
      status = PaymentStatus.FAILED;
      errorMsg = 'Card Declined: Insufficient Funds';
    } else if (normalizedCard === '4000000000000005') {
      status = PaymentStatus.FAILED;
      errorMsg = 'Card Declined: Card Expired';
    } else if (normalizedCard === '4000000000000008') {
      status = PaymentStatus.FAILED;
      errorMsg = 'Card Declined: Suspected Fraud';
    } else if (normalizedCard === '5555555555555555') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      status = PaymentStatus.FAILED;
      errorMsg = 'Payment Gateway Timeout: Connection lost';
    }

    const getSriLankanBankName = (cardNum: string): string | null => {
      if (cardNum.startsWith('453285')) return 'Sampath Bank (Visa)';
      if (cardNum.startsWith('543788')) return 'Sampath Bank (Mastercard)';
      if (cardNum.startsWith('405659')) return 'Commercial Bank (Visa)';
      if (cardNum.startsWith('525496')) return 'Commercial Bank (Mastercard)';
      if (cardNum.startsWith('490822')) return 'Hatton National Bank (Visa)';
      if (cardNum.startsWith('510526'))
        return 'Hatton National Bank (Mastercard)';
      if (cardNum.startsWith('400586')) return 'Bank of Ceylon (Visa)';
      if (cardNum.startsWith('549040')) return 'Bank of Ceylon (Mastercard)';
      if (cardNum.startsWith('415668')) return 'Seylan Bank (Visa)';
      if (cardNum.startsWith('520448')) return 'Seylan Bank (Mastercard)';
      return null;
    };

    const lkBankName = getSriLankanBankName(normalizedCard);
    const resolvedCardBrand =
      lkBankName ||
      (normalizedCard.startsWith('4')
        ? 'Visa'
        : normalizedCard.startsWith('5')
          ? 'Mastercard'
          : 'Generic Sandbox');

    return { status, errorMsg, resolvedCardBrand };
  }

  async sendInvoiceAndNotify(
    reservation: Reservation,
    allPayments?: Payment[],
    profileRepository?: Repository<PhotographerProfile>,
  ) {
    try {
      const { pdfBuffer, invoiceUrl, invoiceNumber } =
        await this.invoiceGenerationService.getOrCreateInvoicePdf(reservation.id);

      await this.emailService.sendInvoice(
        reservation.customer.email,
        `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        invoiceNumber,
        pdfBuffer,
        invoiceUrl,
      );
    } catch (err) {
      console.error('Failed to generate/email invoice PDF', err);
    }
  }
}
