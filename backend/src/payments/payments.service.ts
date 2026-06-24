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
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ChatGateway } from '../reservations/chat.gateway';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
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

    if (reservation.status !== ReservationStatus.PROPOSED) {
      throw new BadRequestException('Reservation is not in proposed state');
    }

    // Expiry Check
    if (reservation.paymentDeadline && new Date() > reservation.paymentDeadline) {
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

    // Log the transaction
    const transactionId = 'ch_mock_' + crypto.randomBytes(8).toString('hex');
    const payment = this.paymentRepository.create({
      reservationId: reservation.id,
      amountInCents: reservation.advancePaymentPriceInCents || 0,
      status,
      transactionId,
      cardBrand: normalizedCard.startsWith('4')
        ? 'Visa'
        : normalizedCard.startsWith('5')
          ? 'Mastercard'
          : 'Generic Sandbox',
      cardLast4: normalizedCard.slice(-4),
      errorMessage: errorMsg,
    });
    await this.paymentRepository.save(payment);

    if (status === PaymentStatus.FAILED) {
      throw new BadRequestException(errorMsg);
    }

    // Update reservation upon SUCCESS
    reservation.status = ReservationStatus.CONFIRMED;
    reservation.clientSelectedPackageId = dto.packageId;
    reservation.totalAmountInCents = selectedPkg.priceInCents;
    reservation.paymentDeadline = undefined; // Clear the lock deadline

    await this.reservationRepository.save(reservation);

    // Broadcast updated reservation
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);

    // Send confirmation email to photographer
    await this.emailService.sendReservationConfirmed(
      reservation.photographer.email,
      reservation.photographer.firstName,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      reservation.date.toString().split('T')[0],
      selectedPkg.name,
    );

    return {
      status: reservation.status,
      transactionId,
      message: 'Payment processed and reservation confirmed successfully',
    };
  }
}
