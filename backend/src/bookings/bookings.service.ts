import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Message } from '../entities/message.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ChatGateway } from '../reservations/chat.gateway';
import { BookingsValidationService } from './bookings-validation.service';
import { BookingsLifecycleService } from './bookings-lifecycle.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private chatGateway: ChatGateway,
    private validationService: BookingsValidationService,
    private lifecycleService: BookingsLifecycleService,
  ) {}

  async getPhotographerProfile(slug: string) {
    const profile = await this.profileRepository.findOne({
      where: { bookingSlug: slug },
      relations: { user: true },
    });

    if (!profile) throw new NotFoundException('Photographer not found');
    if (!profile.user.isActive) {
      throw new NotFoundException('Photographer is not active');
    }

    return {
      bookingSlug: profile.bookingSlug,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      bio: profile.bio,
      specializations: profile.specializations,
      portfolioUrl: profile.portfolioUrl,
      profileImageUrl: profile.profileImageUrl,
      baseLocation: profile.baseLocation,
      city: profile.city,
      district: profile.district,
      locationMapLink: profile.locationMapLink,
      showMapPreviewOnBookingPage: profile.showMapPreviewOnBookingPage,
      isAvailableForBooking: profile.isAvailableForBooking,
      allowedEventTypes: profile.allowedEventTypes,
      allowCustomEventTypes: profile.allowCustomEventTypes,
      offlineMessage: profile.offlineMessage,
    };
  }

  async findCustomerByEmail(email: string) {
    return this.validationService.findCustomerByEmail(email);
  }

  async checkAvailability(
    slug: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const result = await this.validationService.checkAvailability(
      slug,
      date,
      startTime,
      endTime,
    );
    return { available: result.available, reason: result.reason };
  }

  async createBooking(slug: string, dto: CreateBookingDto) {
    return this.lifecycleService.createBooking(slug, dto);
  }

  async trackReservation(token: string, email: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set({ status: ReservationStatus.COMPLETED })
      .where('status = :confirmedStatus', {
        confirmedStatus: ReservationStatus.CONFIRMED,
      })
      .andWhere('date < :todayStr', { todayStr })
      .execute();

    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true, photographer: { profile: true } },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied. Verification required.');
    }

    const successfulPayments = await this.paymentRepository.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
    });
    const totalPaidInCents = successfulPayments.reduce(
      (sum, p) => sum + p.amountInCents,
      0,
    );

    return {
      id: reservation.id,
      status: reservation.status,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      eventType: reservation.eventType,
      location: reservation.location,
      locationMapLink: reservation.locationMapLink,
      city: reservation.city,
      district: reservation.district,
      customerNotes: reservation.customerNotes,
      advancePaymentPriceInCents: reservation.advancePaymentPriceInCents,
      totalAmountInCents: reservation.totalAmountInCents,
      totalPaidInCents,
      quotationNotes: reservation.quotationNotes,
      clientSelectedPackageId: reservation.clientSelectedPackageId,
      selectedPackages: reservation.selectedPackages,
      paymentDeadline: reservation.paymentDeadline,
      rejectionReason: reservation.rejectionReason,
      photographer: {
        firstName: reservation.photographer.firstName,
        lastName: reservation.photographer.lastName,
        bookingSlug: reservation.photographer.profile?.bookingSlug,
      },
    };
  }

  async verifyTrackingEmail(token: string, email: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    const matches =
      reservation.customer.email.toLowerCase() === email.toLowerCase();
    if (!matches) {
      throw new ForbiddenException('Invalid email address for this booking');
    }

    return { verified: true };
  }

  async getMessages(token: string, email: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    return this.messageRepository.find({
      where: { reservationId: reservation.id },
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(token: string, email: string, content: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied');
    }

    const message = this.messageRepository.create({
      reservationId: reservation.id,
      sender: 'CUSTOMER',
      senderName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      content,
    });
    await this.messageRepository.save(message);

    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('message', message);

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('messageReceived', { reservationId: reservation.id, message });

    return message;
  }

  async confirmBooking(token: string, email: string, packageId: string) {
    return this.lifecycleService.confirmBooking(token, email, packageId);
  }

  async cancelBooking(token: string, email: string) {
    return this.lifecycleService.cancelBooking(token, email);
  }
}
