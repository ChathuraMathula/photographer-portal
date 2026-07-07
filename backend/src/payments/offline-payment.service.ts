import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Payment } from '../entities/payment.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Repository } from 'typeorm';
import { ChatGateway } from '../reservations/chat.gateway';
import * as crypto from 'crypto';
import { StripeHelperService } from './stripe-helper.service';
import { PhotographerProfile } from '../entities/photographer-profile.entity';

@Injectable()
export class OfflinePaymentService {
  constructor(
    private readonly stripeHelper: StripeHelperService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async fulfillOfflinePayment(
    reservationId: string,
    photographerId: string,
    reservationRepo: Repository<Reservation>,
    paymentRepo: Repository<Payment>,
    profileRepo: Repository<PhotographerProfile>,
  ) {
    const reservation = await reservationRepo.findOne({
      where: { id: reservationId, photographerId },
      relations: { customer: true, photographer: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Can only fulfill payments for Confirmed bookings.',
      );
    }

    const successfulPayments = await paymentRepo.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
    });
    const totalPaidInCents = successfulPayments.reduce(
      (sum, p) => sum + p.amountInCents,
      0,
    );
    const remainingAmountInCents =
      (reservation.totalAmountInCents || 0) - totalPaidInCents;

    if (remainingAmountInCents <= 0) {
      throw new BadRequestException('Reservation is already fully paid.');
    }

    const transactionId = 'ch_cash_' + crypto.randomBytes(8).toString('hex');
    const payment = paymentRepo.create({
      reservationId: reservation.id,
      amountInCents: remainingAmountInCents,
      status: PaymentStatus.SUCCESS,
      transactionId,
      cardBrand: 'Offline Payment',
      cardLast4: 'Cash',
    });
    await paymentRepo.save(payment);

    const updatedPayments = await paymentRepo.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
    });
    const updatedTotalPaidInCents = updatedPayments.reduce(
      (sum, p) => sum + p.amountInCents,
      0,
    );

    const emitData = {
      ...reservation,
      totalPaidInCents: updatedTotalPaidInCents,
    };

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('reservationUpdated', emitData);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', emitData);
    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('transactionLogged', { reservationId: reservation.id });
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('transactionLogged', { reservationId: reservation.id });

    await this.stripeHelper.sendInvoiceAndNotify(
      reservation,
      [...successfulPayments, payment],
      profileRepo,
    );

    return {
      status: reservation.status,
      transactionId,
      message: 'Logged offline cash payment successfully.',
    };
  }
}
