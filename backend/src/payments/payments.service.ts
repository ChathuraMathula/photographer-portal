import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ChatGateway } from '../reservations/chat.gateway';
import { EmailService } from '../email/email.service';
import { generateInvoicePdf, InvoiceData } from '../reports/invoices-pdf-generator';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly chatGateway: ChatGateway,
    private readonly emailService: EmailService,
  ) {}

  async processPayment(dto: ProcessPaymentDto) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: dto.token },
      relations: { customer: true, photographer: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.customer.email.toLowerCase() !== dto.email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    if (
      reservation.status !== ReservationStatus.PROPOSED &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('Reservation is not in proposed or confirmed state');
    }

    // Expiry Check only for deposit payment
    if (
      reservation.status === ReservationStatus.PROPOSED &&
      reservation.paymentDeadline &&
      new Date() > reservation.paymentDeadline
    ) {
      throw new BadRequestException(
        'Payment deadline has expired (24 hours exceeded). Please contact the photographer.',
      );
    }

    // Verify if package exists in snapshotted selectedPackages
    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find((p: any) => p.id === dto.packageId);
    if (!selectedPkg) {
      throw new BadRequestException('Selected package is not part of the proposal');
    }

    const normalizedCard = dto.cardNumber.replace(/\s+/g, '');

    // Validation
    if (normalizedCard.length !== 16 || !/^\d+$/.test(normalizedCard)) {
      throw new BadRequestException('Card Declined: Invalid Card Format');
    }

    // Simulation outcomes
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
      // Simulate timeout delay then error
      await new Promise((resolve) => setTimeout(resolve, 2000));
      status = PaymentStatus.FAILED;
      errorMsg = 'Payment Gateway Timeout: Connection lost';
    }

    // Determine Sri Lankan Bank if matched, else fallback
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
    const resolvedCardBrand = lkBankName || (normalizedCard.startsWith('4')
      ? 'Visa'
      : normalizedCard.startsWith('5')
        ? 'Mastercard'
        : 'Generic Sandbox');

    // Get all previous successful payments to calculate balance
    const successfulPayments = await this.paymentRepository.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
    });
    const totalPaidInCents = successfulPayments.reduce((sum, p) => sum + p.amountInCents, 0);

    let chargeAmountInCents = 0;
    const isBalancePayment = reservation.status === ReservationStatus.CONFIRMED;

    if (isBalancePayment) {
      chargeAmountInCents = (reservation.totalAmountInCents || selectedPkg.priceInCents) - totalPaidInCents;
      if (chargeAmountInCents <= 0) {
        throw new BadRequestException('Reservation is already fully paid.');
      }
    } else {
      // Calculate dynamic deposit amount based on selected package deposit policy
      let depositAmountInCents = reservation.advancePaymentPriceInCents || 0;
      if (selectedPkg) {
        if (selectedPkg.customDepositAmountInCents !== undefined && selectedPkg.customDepositAmountInCents !== null) {
          depositAmountInCents = selectedPkg.customDepositAmountInCents;
        } else if (selectedPkg.depositType === 'fixed') {
          depositAmountInCents = selectedPkg.depositValue || 0;
        } else if (selectedPkg.depositType === 'percentage') {
          depositAmountInCents = Math.round(
            (selectedPkg.priceInCents * (selectedPkg.depositValue || 0)) / 100,
          );
        }
      }
      chargeAmountInCents = depositAmountInCents;
    }

    // Log the transaction
    const transactionId = 'ch_mock_' + crypto.randomBytes(8).toString('hex');
    const payment = this.paymentRepository.create({
      reservationId: reservation.id,
      amountInCents: chargeAmountInCents,
      status,
      transactionId,
      cardBrand: resolvedCardBrand,
      cardLast4: normalizedCard.slice(-4),
      errorMessage: errorMsg,
    });
    await this.paymentRepository.save(payment);

    if (status === PaymentStatus.FAILED) {
      // Notify photographer of the declined attempt in real-time
      this.chatGateway.server
        .to(`photographer_${reservation.photographerId}`)
        .emit('transactionLogged', { reservationId: reservation.id });
      throw new BadRequestException(errorMsg);
    }

    // Update reservation
    if (!isBalancePayment) {
      reservation.status = ReservationStatus.CONFIRMED;
      reservation.clientSelectedPackageId = dto.packageId;
      reservation.totalAmountInCents = selectedPkg.priceInCents;
      reservation.advancePaymentPriceInCents = chargeAmountInCents;
      reservation.paymentDeadline = undefined; // Clear the lock deadline
    }

    await this.reservationRepository.save(reservation);

    // Broadcast updated reservation + transaction log refresh
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('transactionLogged', { reservationId: reservation.id });
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('transactionLogged', { reservationId: reservation.id });

    // Send confirmation or invoice email
    if (isBalancePayment) {
      await this.sendInvoiceAndNotify(reservation, [
        ...successfulPayments,
        payment,
      ]);
    } else {
      // Send confirmation email to photographer
      await this.emailService.sendReservationConfirmed(
        reservation.photographer.email,
        reservation.photographer.firstName,
        `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        reservation.date.toString().split('T')[0],
        selectedPkg.name,
      );
    }

    return {
      status: reservation.status,
      transactionId,
      message: isBalancePayment
        ? 'Remaining balance processed successfully'
        : 'Payment processed and reservation confirmed successfully',
    };
  }

  async manualFulfillPayment(reservationId: string, photographerId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId, photographerId },
      relations: { customer: true, photographer: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Can only fulfill payments for Confirmed bookings.');
    }

    const successfulPayments = await this.paymentRepository.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
    });
    const totalPaidInCents = successfulPayments.reduce((sum, p) => sum + p.amountInCents, 0);
    const remainingAmountInCents = (reservation.totalAmountInCents || 0) - totalPaidInCents;

    if (remainingAmountInCents <= 0) {
      throw new BadRequestException('Reservation is already fully paid.');
    }

    // Log the manual cash transaction
    const transactionId = 'ch_cash_' + crypto.randomBytes(8).toString('hex');
    const payment = this.paymentRepository.create({
      reservationId: reservation.id,
      amountInCents: remainingAmountInCents,
      status: PaymentStatus.SUCCESS,
      transactionId,
      cardBrand: 'Offline Payment',
      cardLast4: 'Cash',
    });
    await this.paymentRepository.save(payment);

    // Broadcast updated reservation + transaction log refresh
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('transactionLogged', { reservationId: reservation.id });

    // Generate Invoice PDF and email it
    await this.sendInvoiceAndNotify(reservation, [...successfulPayments, payment]);

    return {
      status: reservation.status,
      transactionId,
      message: 'Logged offline cash payment successfully.',
    };
  }

  private async sendInvoiceAndNotify(reservation: Reservation, allPayments: Payment[]) {
    // Fetch customization settings
    const profile = await this.profileRepository.findOne({
      where: { userId: reservation.photographerId },
    });

    const settings = {
      invoiceTitle: profile?.invoiceTitle || 'INVOICE',
      invoiceColor: profile?.invoiceColor || '#2563eb',
      invoiceNotes: profile?.invoiceNotes || 'Thank you for booking with us! We appreciate your trust.',
      invoiceLogoText: profile?.invoiceLogoText || reservation.photographer.firstName,
      invoicePhone: profile?.invoicePhone || '',
      invoiceInstructions: profile?.invoiceInstructions || '',
    };

    // Construct InvoiceData
    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find((p: any) => p.id === reservation.clientSelectedPackageId) || {
      name: 'Custom Booking Package',
      priceInCents: reservation.totalAmountInCents || 0,
    };

    const taxRate = profile?.invoiceTaxRate || 0;
    const packagePriceLkr = (reservation.totalAmountInCents || selectedPkg.priceInCents || 0) / 100;
    const taxAmountLkr = Math.round(packagePriceLkr * (taxRate / 100));
    const grandTotalLkr = packagePriceLkr + taxAmountLkr;
    const totalPaidLkr = allPayments.reduce((sum, p) => sum + p.amountInCents, 0) / 100;
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
      eventDate: reservation.date ? reservation.date.toString().split('T')[0] : '',
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
    
    // Convert PDF document to buffer
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

  async getPhotographerTransactions(photographerId: string) {
    return this.paymentRepository.find({
      where: {
        reservation: {
          photographerId,
        },
      },
      relations: {
        reservation: {
          customer: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getReservationPayments(reservationId: string, userId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId, photographerId: userId },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return this.paymentRepository.find({
      where: { reservationId, status: PaymentStatus.SUCCESS },
    });
  }
}
