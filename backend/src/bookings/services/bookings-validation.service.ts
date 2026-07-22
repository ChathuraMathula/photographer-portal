import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';

@Injectable()
export class BookingsValidationService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async checkAvailability(
    slug: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<{
    available: boolean;
    reason?: string;
    profile?: PhotographerProfile;
  }> {
    const profile = await this.profileRepository.findOneBy({
      bookingSlug: slug,
    });
    if (!profile) {
      return { available: false, reason: 'Photographer not found' };
    }

    if (!profile.isAvailableForBooking) {
      return {
        available: false,
        reason:
          profile.offlineMessage ||
          'Photographer is not taking new bookings at this time.',
        profile,
      };
    }

    const conflicts = await this.reservationRepository
      .createQueryBuilder('res')
      .where('res.photographerId = :photographerId', {
        photographerId: profile.userId,
      })
      .andWhere('res.date = :date', { date })
      .andWhere('res.startTime < :endTime AND res.endTime > :startTime', {
        startTime,
        endTime,
      })
      .andWhere('res.status IN (:...activeStatuses)', {
        activeStatuses: [
          ReservationStatus.PENDING,
          ReservationStatus.PROPOSED,
          ReservationStatus.CONFIRMED,
        ],
      })
      .getMany();

    if (conflicts.length > 0) {
      return {
        available: false,
        reason: 'Time slot overlaps with an existing reservation.',
        profile,
      };
    }

    return { available: true, profile };
  }

  async findCustomerByEmail(email: string) {
    const customer = await this.customerRepository.findOneBy({ email });
    if (!customer) {
      return { exists: false };
    }
    return {
      exists: true,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    };
  }
}
