import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Package } from '../entities/package.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { ProposeQuotationDto } from './dto/propose-quotation.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ChatGateway } from './chat.gateway';
import { EmailService } from '../email/email.service';
import { UserRole } from '../entities/user.entity';

interface JwtUser {
  userId: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ReservationsQuotationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly chatGateway: ChatGateway,
    private readonly emailService: EmailService,
  ) {}

  async proposeQuotation(
    reservation: Reservation,
    dto: ProposeQuotationDto,
    user: JwtUser,
  ) {
    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.PROPOSED
    ) {
      throw new BadRequestException(
        'Can only propose quotation for pending or proposed requests',
      );
    }

    const packageIds = dto.packageIds || [];
    const pkgs =
      packageIds.length > 0
        ? await this.packageRepository.find({
            where: { id: In(packageIds), photographerId: user.userId },
          })
        : [];

    if (pkgs.length === 0 && packageIds.length > 0) {
      throw new BadRequestException('Invalid package IDs selected');
    }

    if (pkgs.length === 0 && !dto.customPackage) {
      throw new BadRequestException(
        'Must select at least one package or include a custom package',
      );
    }

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
        'This time slot is already booked and confirmed.',
      );
    }

    reservation.status = ReservationStatus.PROPOSED;
    reservation.advancePaymentPriceInCents = dto.advancePaymentPriceInCents;
    reservation.quotationNotes = dto.quotationNotes;
    reservation.usePackageWiseDeposit = dto.usePackageWiseDeposit ?? false;

    const selectedPkgsMapped = pkgs.map((p) => {
      const customDeposit =
        dto.packageDeposits && dto.packageDeposits[p.id] !== undefined
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
      const customDeposit =
        dto.packageDeposits && dto.packageDeposits['custom'] !== undefined
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
    if (!reservation.paymentDeadline) {
      reservation.paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await this.reservationRepository.save(reservation);

    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`photographer_${user.userId}`)
      .emit('reservationUpdated', reservation);

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
    reservation: Reservation,
    dto: RejectReservationDto,
    user: JwtUser,
  ) {
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Can only reject pending requests');
    }

    reservation.status = ReservationStatus.REJECTED;
    reservation.rejectionReason = dto.rejectionReason;

    await this.reservationRepository.save(reservation);

    this.chatGateway.server
      .to(`reservation_${reservation.id}`)
      .emit('reservationUpdated', reservation);
    this.chatGateway.server
      .to(`photographer_${user.userId}`)
      .emit('reservationUpdated', reservation);

    await this.emailService.sendReservationRejected(
      reservation.customer.email,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      dto.rejectionReason,
    );

    const profile = await this.profileRepository.findOneBy({
      userId: user.userId,
    });
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
}
