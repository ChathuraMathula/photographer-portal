import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import * as crypto from 'crypto';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Customer } from '../entities/customer.entity';
import { Package } from '../entities/package.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ChatGateway } from './chat.gateway';
import { UserRole } from '../entities/user.entity';

interface JwtUser {
  userId: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ReservationsLifecycleService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createManualBooking(dto: CreateManualBookingDto, user: JwtUser) {
    if (user.role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException(
        'Only Photographers can create manual bookings',
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const profile = await this.profileRepository.findOneBy({
      userId: user.userId,
    });
    if (!profile) throw new NotFoundException('Photographer profile not found');

    const now = new Date();
    const conflicts = await this.reservationRepository
      .createQueryBuilder('res')
      .where('res.photographerId = :photographerId', {
        photographerId: user.userId,
      })
      .andWhere('res.date = :date', { date: dto.date })
      .andWhere('res.startTime < :endTime AND res.endTime > :startTime', {
        startTime: dto.startTime,
        endTime: dto.endTime,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('res.status IN (:...activeStatuses)', {
            activeStatuses: [
              ReservationStatus.PENDING,
              ReservationStatus.CONFIRMED,
            ],
          }).orWhere(
            'res.status = :proposedStatus AND (res.paymentDeadline IS NULL OR res.paymentDeadline > :now)',
            { proposedStatus: ReservationStatus.PROPOSED, now },
          );
        }),
      )
      .getMany();

    if (conflicts.length > 0) {
      throw new BadRequestException('The requested time slot is not available');
    }

    let customer = await this.customerRepository.findOneBy({
      email: dto.email,
    });
    if (!customer) {
      customer = this.customerRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      });
      await this.customerRepository.save(customer);
    }

    let selectedPackagesSnap: any = null;
    if (dto.packageId) {
      const pkg = await this.packageRepository.findOneBy({ id: dto.packageId });
      if (pkg) {
        selectedPackagesSnap = [
          {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            priceInCents: pkg.priceInCents,
            durationHours: pkg.durationHours,
            includes: pkg.includes,
            depositType: pkg.depositType,
            depositValue: pkg.depositValue,
          },
        ];
      }
    }

    const reservation = this.reservationRepository.create({
      customerId: customer.id,
      photographerId: user.userId,
      date: dto.date as any,
      startTime: dto.startTime,
      endTime: dto.endTime,
      eventType: dto.eventType,
      location: dto.location,
      locationMapLink: dto.locationMapLink,
      city: dto.city,
      district: dto.district,
      customerNotes: dto.notes,
      status: ReservationStatus.CONFIRMED,
      reservationToken: crypto.randomBytes(32).toString('hex'),
      advancePaymentPriceInCents: dto.advancePaymentPriceInCents,
      totalAmountInCents: dto.totalAmountInCents,
      clientSelectedPackageId: dto.packageId,
      selectedPackages: selectedPackagesSnap,
    });

    await this.reservationRepository.save(reservation);

    if (dto.advancePaymentPriceInCents && dto.advancePaymentPriceInCents > 0) {
      const payment = this.paymentRepository.create({
        reservationId: reservation.id,
        amountInCents: dto.advancePaymentPriceInCents,
        status: PaymentStatus.SUCCESS,
        transactionId: 'ch_manual_' + crypto.randomBytes(8).toString('hex'),
        cardBrand: 'Offline Payment',
        cardLast4: 'Cash',
      });
      await this.paymentRepository.save(payment);
    }

    reservation.customer = customer;

    this.chatGateway.server
      .to(`photographer_${user.userId}`)
      .emit('reservationCreated', reservation);
    this.chatGateway.broadcastAvailabilityChange(
      profile.bookingSlug,
      dto.date,
      dto.startTime,
      dto.endTime,
      false,
    );

    return reservation;
  }
}
