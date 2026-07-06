import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';

@Injectable()
export class BookingsValidationService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async findCustomerByEmail(email: string) {
    if (!email) return null;
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .where('LOWER(customer.email) = :email', {
        email: email.trim().toLowerCase(),
      })
      .getOne();
    if (!customer) return null;
    return {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    };
  }

  async checkAvailability(
    slug: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (date <= todayStr) {
      return {
        available: false,
        reason: 'Checking availability for today or past dates is not allowed.',
      };
    }

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

    return { available: conflicts.length === 0, profile };
  }
}
