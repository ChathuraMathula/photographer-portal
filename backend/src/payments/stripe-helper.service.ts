import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '../entities/payment.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Payment } from '../entities/payment.entity';
import { EmailService } from '../email/email.service';
import { generateInvoicePdf, InvoiceData } from '../reports/invoices-pdf-generator';
import { Repository } from 'typeorm';

@Injectable()
export class StripeHelperService {
  constructor(private readonly emailService: EmailService) {}

  async simulateStripeCharge(cardNumber: string): Promise<{ status: PaymentStatus; errorMsg?: string; resolvedCardBrand: string }> {
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
      if (cardNum.startsWith('510526')) return 'Hatton National Bank (Mastercard)';
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
    allPayments: Payment[],
    profileRepository: Repository<PhotographerProfile>
  ) {
    const profile = await profileRepository.findOne({
      where: { userId: reservation.photographerId },
    });

    const settings = {
      invoiceTitle: profile?.invoiceTitle || 'INVOICE',
      invoiceColor: profile?.invoiceColor || '#2563eb',
      invoiceNotes:
        profile?.invoiceNotes ||
        'Thank you for booking with us! We appreciate your trust.',
      invoiceLogoText:
        profile?.invoiceLogoText || reservation.photographer.firstName,
      invoicePhone: profile?.invoicePhone || '',
      invoiceInstructions: profile?.invoiceInstructions || '',
    };

    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find(
      (p: any) => p.id === reservation.clientSelectedPackageId,
    ) || {
      name: 'Custom Booking Package',
      priceInCents: reservation.totalAmountInCents || 0,
    };

    const taxRate = profile?.invoiceTaxRate || 0;
    const packagePriceLkr =
      (reservation.totalAmountInCents || selectedPkg.priceInCents || 0) / 100;
    const taxAmountLkr = Math.round(packagePriceLkr * (taxRate / 100));
    const grandTotalLkr = packagePriceLkr + taxAmountLkr;
    const totalPaidLkr =
      allPayments.reduce((sum, p) => sum + p.amountInCents, 0) / 100;
    const balanceDueLkr = Math.max(0, grandTotalLkr - totalPaidLkr);

    const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const mappedPayments = allPayments.map((p) => ({
      date: new Date(p.createdAt).toLocaleDateString(),
      method: `${p.cardBrand} (*${p.cardLast4})`,
      amountLkr: p.amountInCents / 100,
      transactionId: p.transactionId,
    }));

    const invoiceData: InvoiceData = {
      invoiceNumber,
      issueDate: new Date().toLocaleDateString(),
      clientName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      clientEmail: reservation.customer.email,
      clientPhone: reservation.customer.phone || '',
      photographerName: `${reservation.photographer.firstName} ${reservation.photographer.lastName}`,
      photographerEmail: reservation.photographer.email,
      photographerPhone: '',
      eventDate: reservation.date
        ? reservation.date.toString().split('T')[0]
        : '',
      eventTime: `${reservation.startTime || ''} - ${reservation.endTime || ''}`,
      eventType: reservation.eventType || 'Event',
      location: reservation.location || '',
      packageName: selectedPkg.name,
      packagePriceLkr,
      payments: mappedPayments,
      totalPaidLkr,
      balanceDueLkr,
      taxRate,
      taxAmountLkr,
      grandTotalLkr,
      settings,
    };

    const pdfDoc = generateInvoicePdf(invoiceData);

    const getPdfBuffer = async (doc: any): Promise<Buffer> => {
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));
        doc.end();
      });
    };

    try {
      const pdfBuffer = await getPdfBuffer(pdfDoc);
      await this.emailService.sendInvoice(
        reservation.customer.email,
        `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        invoiceNumber,
        pdfBuffer,
      );
    } catch (err) {
      console.error('Failed to generate/email invoice PDF', err);
    }
  }
}
