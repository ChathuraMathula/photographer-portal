import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

@Injectable()
export class BookingsQueryService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
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
      invoiceUrl: reservation.invoiceUrl,
      invoiceGeneratedAt: reservation.invoiceGeneratedAt,
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
}
