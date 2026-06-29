import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import * as crypto from 'crypto';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Customer } from '../entities/customer.entity';
import { User, UserRole } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { Message } from '../entities/message.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { ProposeQuotationDto } from './dto/propose-quotation.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ChatGateway } from './chat.gateway';
import { EmailService } from '../email/email.service';

interface JwtUser {
  userId: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(PhotographerProfile)
    private profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private chatGateway: ChatGateway,
    private emailService: EmailService,
  ) {}

  async findAll(user: JwtUser) {
    // Auto-complete reservations whose dates have passed
    const todayStr = new Date().toISOString().split('T')[0];
    await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set({ status: ReservationStatus.COMPLETED })
      .where('status = :confirmedStatus', { confirmedStatus: ReservationStatus.CONFIRMED })
      .andWhere('date < :todayStr', { todayStr })
      .execute();

    const query = this.reservationRepository.createQueryBuilder('res')
      .leftJoinAndSelect('res.customer', 'customer')
      .leftJoinAndSelect('res.photographer', 'photographer')
      .leftJoinAndSelect('res.messages', 'messages');

    if (user.role === UserRole.PHOTOGRAPHER) {
      query.where('res.photographerId = :photographerId', {
        photographerId: user.userId,
      });
    }

    return query.orderBy('res.date', 'DESC').addOrderBy('res.startTime', 'ASC').getMany();
  }

  async findOne(id: string, user: JwtUser) {
    // Auto-complete reservations whose dates have passed
    const todayStr = new Date().toISOString().split('T')[0];
    await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set({ status: ReservationStatus.COMPLETED })
      .where('status = :confirmedStatus', { confirmedStatus: ReservationStatus.CONFIRMED })
      .andWhere('date < :todayStr', { todayStr })
      .execute();

    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { customer: true, photographer: true, messages: true },
    });

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (
      user.role === UserRole.PHOTOGRAPHER &&
      reservation.photographerId !== user.userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return reservation;
  }

  async updateStatus(id: string, status: ReservationStatus, user: JwtUser) {
    const reservation = await this.findOne(id, user);
    reservation.status = status;
    const saved = await this.reservationRepository.save(reservation);
    this.chatGateway.server.to(`reservation_${reservation.id}`).emit('reservationUpdated', saved);
    this.chatGateway.server.to(`photographer_${user.userId}`).emit('reservationUpdated', saved);
    return saved;
  }

  async createManualBooking(dto: CreateManualBookingDto, user: JwtUser) {
    if (user.role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException('Only Photographers can create manual bookings');
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Check availability
    const profile = await this.profileRepository.findOneBy({ userId: user.userId });
    if (!profile) throw new NotFoundException('Photographer profile not found');

    const now = new Date();
    const conflicts = await this.reservationRepository.createQueryBuilder('res')
      .where('res.photographerId = :photographerId', { photographerId: user.userId })
      .andWhere('res.date = :date', { date: dto.date })
      .andWhere('res.startTime < :endTime AND res.endTime > :startTime', {
        startTime: dto.startTime,
        endTime: dto.endTime,
      })
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

    if (conflicts.length > 0) {
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
      customerNotes: dto.notes,
      status: ReservationStatus.CONFIRMED, // Manual offline bookings are pre-confirmed
      reservationToken: crypto.randomBytes(32).toString('hex'),
      advancePaymentPriceInCents: dto.advancePaymentPriceInCents,
      totalAmountInCents: dto.totalAmountInCents,
      clientSelectedPackageId: dto.packageId,
      selectedPackages: selectedPackagesSnap,
    });

    await this.reservationRepository.save(reservation);

    // Save payment log if deposit is provided
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

    // Populate customer relation for the socket broadcast
    reservation.customer = customer;

    // Broadcast new reservation created
    this.chatGateway.server.to(`photographer_${user.userId}`).emit('reservationCreated', reservation);

    // Broadcast change
    this.chatGateway.broadcastAvailabilityChange(
      profile.bookingSlug,
      dto.date,
      dto.startTime,
      dto.endTime,
      false,
    );

    return reservation;
  }

  async proposeQuotation(
    id: string,
    dto: ProposeQuotationDto,
    user: JwtUser,
  ) {
    const reservation = await this.findOne(id, user);

    if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.PROPOSED) {
      throw new BadRequestException('Can only propose quotation for pending or proposed requests');
    }

    // Find packages
    const packageIds = dto.packageIds || [];
    const pkgs = packageIds.length > 0
      ? await this.packageRepository.find({
          where: { id: In(packageIds), photographerId: user.userId },
        })
      : [];

    if (pkgs.length === 0 && packageIds.length > 0) {
      throw new BadRequestException('Invalid package IDs selected');
    }

    if (pkgs.length === 0 && !dto.customPackage) {
      throw new BadRequestException('Must select at least one package or include a custom package');
    }

    // Check if this time slot is already booked and confirmed
    const conflicts = await this.reservationRepository.createQueryBuilder('res')
      .where('res.photographerId = :photographerId', { photographerId: reservation.photographerId })
      .andWhere('res.date = :date', { date: reservation.date })
      .andWhere('res.startTime < :endTime AND res.endTime > :startTime', {
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      })
      .andWhere('res.status = :confirmedStatus', { confirmedStatus: ReservationStatus.CONFIRMED })
      .getMany();

    if (conflicts.length > 0) {
      throw new BadRequestException('This time slot is already booked and confirmed.');
    }

    // Update reservation
    reservation.status = ReservationStatus.PROPOSED;
    reservation.advancePaymentPriceInCents = dto.advancePaymentPriceInCents;
    reservation.quotationNotes = dto.quotationNotes;
    reservation.usePackageWiseDeposit = dto.usePackageWiseDeposit ?? false;

    // Snapshot packages
    const selectedPkgsMapped = pkgs.map((p) => {
      const customDeposit = dto.packageDeposits && dto.packageDeposits[p.id] !== undefined
        ? dto.packageDeposits[p.id]
        : null;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        priceInCents: p.priceInCents,
        durationHours: p.durationHours,
        includes: p.includes,
        depositType: p.depositType,
        depositValue: p.depositValue,
        customDepositAmountInCents: customDeposit,
        isCustom: false,
      };
    });

    if (dto.customPackage) {
      const cp = dto.customPackage;
      const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const customDeposit = dto.packageDeposits && dto.packageDeposits['custom'] !== undefined
        ? dto.packageDeposits['custom']
        : null;

      selectedPkgsMapped.push({
        id: customId,
        name: cp.name,
        description: cp.description,
        priceInCents: cp.priceInCents,
        durationHours: cp.durationHours,
        includes: cp.includes,
        depositType: cp.depositType,
        depositValue: cp.depositValue,
        customDepositAmountInCents: customDeposit,
        isCustom: true,
      });
    }

    reservation.selectedPackages = selectedPkgsMapped;
    // 24-hour deadline from now
    reservation.paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.reservationRepository.save(reservation);

    // Broadcast updated reservation
    this.chatGateway.server.to(`reservation_${reservation.id}`).emit('reservationUpdated', reservation);
    this.chatGateway.server.to(`photographer_${user.userId}`).emit('reservationUpdated', reservation);

    // Send email notification to client
    const trackingLink = `http://localhost:4000/book/track/${reservation.reservationToken}`;
    await this.emailService.sendQuotationProposed(
      reservation.customer.email,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      trackingLink,
      dto.advancePaymentPriceInCents,
      dto.quotationNotes,
    );

    return reservation;
  }

  async rejectReservation(
    id: string,
    dto: RejectReservationDto,
    user: JwtUser,
  ) {
    const reservation = await this.findOne(id, user);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Can only reject pending requests');
    }

    reservation.status = ReservationStatus.REJECTED;
    reservation.rejectionReason = dto.rejectionReason;

    await this.reservationRepository.save(reservation);

    // Broadcast updated reservation
    this.chatGateway.server.to(`reservation_${reservation.id}`).emit('reservationUpdated', reservation);
    this.chatGateway.server.to(`photographer_${user.userId}`).emit('reservationUpdated', reservation);

    // Send rejection email to client
    await this.emailService.sendReservationRejected(
      reservation.customer.email,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      dto.rejectionReason,
    );

    // Broadcast availability change to unlock
    const profile = await this.profileRepository.findOneBy({ userId: user.userId });
    if (profile) {
      this.chatGateway.broadcastAvailabilityChange(
        profile.bookingSlug,
        reservation.date.toString().split('T')[0],
        reservation.startTime,
        reservation.endTime,
        true,
      );
    }

    return reservation;
  }

  async getMessages(id: string, user: JwtUser) {
    // Verifies ownership
    await this.findOne(id, user);

    return this.messageRepository.find({
      where: { reservationId: id },
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(id: string, content: string, user: JwtUser) {
    const reservation = await this.findOne(id, user);

    const message = this.messageRepository.create({
      reservationId: id,
      sender: 'PHOTOGRAPHER',
      senderName: user.firstName || 'Photographer',
      content,
    });
    await this.messageRepository.save(message);

    // Broadcast to room
    this.chatGateway.server
      .to(`reservation_${id}`)
      .emit('message', message);

    this.chatGateway.server
      .to(`photographer_${reservation.photographerId}`)
      .emit('messageReceived', { reservationId: id, message });

    return message;
  }
}
