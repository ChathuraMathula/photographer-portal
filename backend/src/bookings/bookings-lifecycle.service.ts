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
import { Customer } from '../entities/customer.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ChatGateway } from '../reservations/chat.gateway';
import { EmailService } from '../email/email.service';
import { BookingsValidationService } from './bookings-validation.service';

@Injectable()
export class BookingsLifecycleService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly chatGateway: ChatGateway,
    private readonly emailService: EmailService,
    private readonly validationService: BookingsValidationService,
  ) {}

  async createBooking(slug: string, dto: CreateBookingDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (dto.date <= todayStr) {
      throw new BadRequestException(
        'Booking is only allowed for future dates (tomorrow onwards).',
      );
    }

    const { available, profile } =
      await this.validationService.checkAvailability(
        slug,
        dto.date,
        dto.startTime,
        dto.endTime,
      );
    if (!available || !profile) {
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

    const token = crypto.randomBytes(32).toString('hex');
    const reservation = this.reservationRepository.create({
      customerId: customer.id,
      photographerId: profile.userId,
      date: dto.date as any,
      startTime: dto.startTime,
      endTime: dto.endTime,
      eventType: dto.eventType,
      location: dto.location,
      locationMapLink: dto.locationMapLink,
      city: dto.city,
      district: dto.district,
      customerNotes: dto.notes,
      status: ReservationStatus.PENDING,
      reservationToken: token,
    });
    await this.reservationRepository.save(reservation);

    reservation.customer = customer;

    this.chatGateway.server
      .to(`photographer_${profile.userId}`)
      .emit('reservationCreated', reservation);

    const trackingLink = `http://localhost:4000/book/track/${token}`;
    await this.emailService.sendBookingReceived(
      customer.email,
      `${customer.firstName} ${customer.lastName}`,
      trackingLink,
    );

    this.chatGateway.broadcastAvailabilityChange(
      slug,
      dto.date,
      dto.startTime,
      dto.endTime,
      false,
    );

    return {
      reservationToken: token,
      message: 'Reservation request submitted successfully',
    };
  }

  async confirmBooking(token: string, email: string, packageId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true, photographer: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    if (reservation.status !== ReservationStatus.PROPOSED) {
      throw new BadRequestException('Reservation is not in proposed state');
    }

    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find((p: any) => p.id === packageId);
    if (!selectedPkg) {
      throw new BadRequestException(
        'Selected package is not part of the proposal',
      );
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.clientSelectedPackageId = packageId;
    reservation.totalAmountInCents = selectedPkg.priceInCents;
    reservation.paymentDeadline = undefined;

    await this.reservationRepository.save(reservation);

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);

    await this.emailService.sendReservationConfirmed(
      reservation.photographer.email,
      reservation.photographer.firstName,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      reservation.date.toString().split('T')[0],
      selectedPkg.name,
    );

    return {
      status: reservation.status,
      message: 'Reservation confirmed successfully',
    };
  }

  async cancelBooking(token: string, email: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    if (
      reservation.status !== ReservationStatus.PROPOSED &&
      reservation.status !== ReservationStatus.PENDING
    ) {
      throw new BadRequestException('Cannot cancel reservation in this state');
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.paymentDeadline = undefined;

    await this.reservationRepository.save(reservation);

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);

    const profile = await this.profileRepository.findOneBy({
      userId: reservation.photographerId,
    });
    if (profile) {
      this.chatGateway.broadcastAvailabilityChange(
        profile.bookingSlug,
        reservation.date as any,
        reservation.startTime,
        reservation.endTime,
        true,
      );
    }

    return {
      status: reservation.status,
      message: 'Reservation cancelled successfully',
    };
  }
}
