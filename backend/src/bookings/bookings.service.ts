import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Package } from '../entities/package.entity';
import { Message } from '../entities/message.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ChatGateway } from '../reservations/chat.gateway';
import { EmailService } from '../email/email.service';

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
    private chatGateway: ChatGateway,
    private emailService: EmailService,
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
      isAvailableForBooking: profile.isAvailableForBooking,
      allowedEventTypes: profile.allowedEventTypes,
      allowCustomEventTypes: profile.allowCustomEventTypes,
    };
  }

  async checkAvailability(
    slug: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const profile = await this.profileRepository.findOne({
      where: { bookingSlug: slug },
      relations: { user: true },
    });
    if (!profile) throw new NotFoundException('Photographer not found');

    if (!profile.isAvailableForBooking) {
      return {
        available: false,
        reason: 'Photographer is not accepting bookings',
      };
    }

    const now = new Date();

    // Check overlaps:
    // A conflict is any reservation for the same photographer, on the same date, which overlap with the requested time:
    // requested.startTime < existing.endTime AND requested.endTime > existing.startTime
    // AND is in status PENDING, CONFIRMED, or PROPOSED (only if PROPOSED lock hasn't expired yet)
    const conflicts = await this.reservationRepository.createQueryBuilder('res')
      .where('res.photographerId = :photographerId', { photographerId: profile.userId })
      .andWhere('res.date = :date', { date })
      .andWhere('res.startTime < :endTime AND res.endTime > :startTime', { startTime, endTime })
      .andWhere(
        new Brackets((qb) => {
          qb.where('res.status IN (:...activeStatuses)', {
            activeStatuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
          }).orWhere(
            'res.status = :proposedStatus AND (res.paymentDeadline IS NULL OR res.paymentDeadline > :now)',
            { proposedStatus: ReservationStatus.PROPOSED, now },
          );
        }),
      )
      .getMany();

    return { available: conflicts.length === 0 };
  }

  async createBooking(slug: string, dto: CreateBookingDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const profile = await this.profileRepository.findOne({
      where: { bookingSlug: slug },
      relations: { user: true },
    });
    if (!profile) throw new NotFoundException('Photographer not found');
    if (!profile.isAvailableForBooking) {
      throw new BadRequestException('Photographer is not accepting bookings');
    }

    const { available } = await this.checkAvailability(
      slug,
      dto.date,
      dto.startTime,
      dto.endTime,
    );
    if (!available) {
      throw new BadRequestException('The requested time slot is not available');
    }

    // Find or create customer
    let customer = await this.customerRepository.findOneBy({ email: dto.email });
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
      customerNotes: dto.notes,
      status: ReservationStatus.PENDING,
      reservationToken: token,
    });
    await this.reservationRepository.save(reservation);

    // Broadcast new reservation created
    this.chatGateway.server.to(`photographer_${profile.userId}`).emit('reservationCreated', reservation);

    // Send email notification to customer
    const trackingLink = `http://localhost:4000/book/track/${token}`;
    await this.emailService.sendBookingReceived(
      customer.email,
      `${customer.firstName} ${customer.lastName}`,
      trackingLink,
    );

    // Broadcast real-time availability change
    this.chatGateway.broadcastAvailabilityChange(slug, dto.date, dto.startTime, dto.endTime, false);

    return {
      reservationToken: token,
      message: 'Reservation request submitted successfully',
    };
  }

  async trackReservation(token: string, email: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true, photographer: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (reservation.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw new ForbiddenException('Access denied. Verification required.');
    }

    return {
      id: reservation.id,
      status: reservation.status,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      eventType: reservation.eventType,
      location: reservation.location,
      customerNotes: reservation.customerNotes,
      advancePaymentPriceInCents: reservation.advancePaymentPriceInCents,
      quotationNotes: reservation.quotationNotes,
      clientSelectedPackageId: reservation.clientSelectedPackageId,
      selectedPackages: reservation.selectedPackages,
      paymentDeadline: reservation.paymentDeadline,
      rejectionReason: reservation.rejectionReason,
      photographer: {
        firstName: reservation.photographer.firstName,
        lastName: reservation.photographer.lastName,
      },
    };
  }

  async verifyTrackingEmail(token: string, email: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
      relations: { customer: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    const matches = reservation.customer.email.toLowerCase() === email.toLowerCase();
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

    // Broadcast to room
    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('message', message);

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('messageReceived', { reservationId: reservation.id, message });

    return message;
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

    // Verify if package exists in snapshotted selectedPackages
    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find((p: any) => p.id === packageId);
    if (!selectedPkg) {
      throw new BadRequestException('Selected package is not part of the proposal');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.clientSelectedPackageId = packageId;
    reservation.totalAmountInCents = selectedPkg.priceInCents;
    reservation.paymentDeadline = undefined; // Clear lock expiry

    await this.reservationRepository.save(reservation);

    // Broadcast updated reservation
    this.chatGateway.server.to(`photographer_${reservation.photographerId}`).emit('reservationUpdated', reservation);
    this.chatGateway.server.to(`reservation_${reservation.id}`).emit('reservationUpdated', reservation);

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
      message: 'Reservation confirmed successfully',
    };
  }
}
