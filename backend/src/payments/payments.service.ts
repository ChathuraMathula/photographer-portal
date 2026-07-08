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
import { StripeHelperService } from './stripe-helper.service';
import { OfflinePaymentService } from './offline-payment.service';

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
    private readonly stripeHelper: StripeHelperService,
    private readonly offlinePaymentService: OfflinePaymentService,
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
      throw new BadRequestException(
        'Reservation is not in proposed or confirmed state',
      );
    }

    if (
      reservation.status === ReservationStatus.PROPOSED &&
      reservation.paymentDeadline &&
      new Date() > reservation.paymentDeadline
    ) {
      throw new BadRequestException(
        'Payment deadline has expired (24 hours exceeded). Please contact the photographer.',
      );
    }

    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find((p: any) => p.id === dto.packageId);
    if (!selectedPkg) {
      throw new BadRequestException(
        'Selected package is not part of the proposal',
      );
    }

    const { status, errorMsg, resolvedCardBrand } =
      await this.stripeHelper.simulateStripeCharge(dto.cardNumber);

    const successfulPayments = await this.paymentRepository.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
    });
    const totalPaidInCents = successfulPayments.reduce(
      (sum, p) => sum + p.amountInCents,
      0,
    );

    let chargeAmountInCents = 0;
    const isBalancePayment = reservation.status === ReservationStatus.CONFIRMED;

    if (isBalancePayment) {
      chargeAmountInCents =
        (reservation.totalAmountInCents || selectedPkg.priceInCents) -
        totalPaidInCents;
      if (chargeAmountInCents <= 0) {
        throw new BadRequestException('Reservation is already fully paid.');
      }
    } else {
      let depositAmountInCents = reservation.advancePaymentPriceInCents || 0;
      if (selectedPkg) {
        if (
          selectedPkg.customDepositAmountInCents !== undefined &&
          selectedPkg.customDepositAmountInCents !== null
        ) {
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

    const transactionId = 'ch_mock_' + crypto.randomBytes(8).toString('hex');
    const payment = this.paymentRepository.create({
      reservationId: reservation.id,
      amountInCents: chargeAmountInCents,
      status,
      transactionId,
      cardBrand: resolvedCardBrand,
      cardLast4: dto.cardNumber.replace(/\s+/g, '').slice(-4),
      errorMessage: errorMsg,
    });
    await this.paymentRepository.save(payment);

    if (status === PaymentStatus.FAILED) {
      this.chatGateway.server
        .to(`photographer_${reservation.photographerId}`)
        .emit('transactionLogged', { reservationId: reservation.id });
      throw new BadRequestException(errorMsg);
    }

    if (!isBalancePayment) {
      const conflicts = await this.reservationRepository
        .createQueryBuilder('res')
        .where('res.photographerId = :photographerId', {
          photographerId: reservation.photographerId,
        })
        .andWhere('res.date = :date', { date: reservation.date })
        .andWhere('res.startTime < :endTime AND res.endTime > :startTime', {
          startTime: reservation.startTime,
          endTime: reservation.endTime,
        })
        .andWhere('res.status = :confirmedStatus', {
          confirmedStatus: ReservationStatus.CONFIRMED,
        })
        .getMany();

      if (conflicts.length > 0) {
        throw new BadRequestException(
          'This time slot has already been booked and confirmed by another user in the meantime.',
        );
      }

      reservation.status = ReservationStatus.CONFIRMED;
      reservation.clientSelectedPackageId = dto.packageId;
      reservation.totalAmountInCents = selectedPkg.priceInCents;
      reservation.advancePaymentPriceInCents = chargeAmountInCents;
      reservation.paymentDeadline = undefined;
    }

    await this.reservationRepository.save(reservation);

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

    if (isBalancePayment) {
      await this.stripeHelper.sendInvoiceAndNotify(
        reservation,
        [...successfulPayments, payment],
        this.profileRepository,
      );
    } else {
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
    return this.offlinePaymentService.fulfillOfflinePayment(
      reservationId,
      photographerId,
      this.reservationRepository,
      this.paymentRepository,
      this.profileRepository,
    );
  }

  async getPhotographerTransactions(
    photographerId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      method?: string;
      sortBy?: string;
      sortOrder?: string;
      filterDate?: string;
    } = {},
  ) {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'res')
      .leftJoinAndSelect('res.customer', 'customer')
      .where('res.photographerId = :photographerId', { photographerId });

    // Handle sorting
    const sortBy = query.sortBy || 'date';
    const sortOrder = (query.sortOrder === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    if (sortBy === 'amount') {
      qb.orderBy('payment.amountInCents', sortOrder);
    } else {
      qb.orderBy('payment.createdAt', sortOrder);
    }

    if (query.status && query.status !== 'ALL') {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.method && query.method !== 'ALL') {
      if (query.method === 'CASH') {
        qb.andWhere('payment.cardBrand = :cardBrand', {
          cardBrand: 'Offline Payment',
        });
      } else if (query.method === 'CARD') {
        qb.andWhere('payment.cardBrand != :cardBrand', {
          cardBrand: 'Offline Payment',
        });
      }
    }

    if (query.filterDate) {
      qb.andWhere('DATE(payment.createdAt) = :filterDate', {
        filterDate: query.filterDate,
      });
    }

    if (query.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        `(
          LOWER(customer.firstName) LIKE :search
          OR LOWER(customer.lastName) LIKE :search
          OR LOWER(customer.email) LIKE :search
          OR LOWER(payment.transactionId) LIKE :search
          OR LOWER(payment.cardBrand) LIKE :search
        )`,
        { search: searchPattern },
      );
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const statsQb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'res')
      .where('res.photographerId = :photographerId', { photographerId })
      .andWhere('payment.status = :successStatus', {
        successStatus: PaymentStatus.SUCCESS,
      });

    const stats = await statsQb
      .select('SUM(payment.amountInCents)', 'totalAmount')
      .addSelect(
        "SUM(CASE WHEN payment.cardBrand = 'Offline Payment' THEN 1 ELSE 0 END)",
        'cashCount',
      )
      .addSelect(
        "SUM(CASE WHEN payment.cardBrand != 'Offline Payment' THEN 1 ELSE 0 END)",
        'cardCount',
      )
      .getRawOne();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalRevenueInCents: parseInt(stats?.totalAmount || '0', 10),
        cashPaymentsCount: parseInt(stats?.cashCount || '0', 10),
        cardPaymentsCount: parseInt(stats?.cardCount || '0', 10),
      },
    };
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
