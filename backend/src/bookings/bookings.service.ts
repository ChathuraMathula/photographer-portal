import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { User } from '../schemas/user.schema';
import { Customer } from '../schemas/customer.schema';
import { Reservation, ReservationStatus } from '../schemas/reservation.schema';
import { PhotographerProfile } from '../schemas/photographer-profile.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(PhotographerProfile.name)
    private profileModel: Model<PhotographerProfile>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) {}

  async getPhotographerProfile(slug: string) {
    const profile = await this.profileModel
      .findOne({ bookingSlug: slug })
      .populate<{ userId: User }>('userId', '-passwordHash');

    if (!profile) throw new NotFoundException('Photographer not found');

    const { userId: user } = profile;
    return {
      bookingSlug: profile.bookingSlug,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: profile.bio,
      specializations: profile.specializations,
      portfolioUrl: profile.portfolioUrl,
      profileImageUrl: profile.profileImageUrl,
      baseLocation: profile.baseLocation,
      isAvailableForBooking: profile.isAvailableForBooking,
    };
  }

  async checkAvailability(
    slug: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const profile = await this.profileModel.findOne({ bookingSlug: slug });
    if (!profile) throw new NotFoundException('Photographer not found');

    if (!profile.isAvailableForBooking) {
      return { available: false, reason: 'Photographer is not accepting bookings' };
    }

    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    // Overlap condition: existing.start < requested.end  AND  existing.end > requested.start
    const conflict = await this.reservationModel.findOne({
      photographerId: profile.userId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    return { available: !conflict };
  }

  async createBooking(slug: string, dto: CreateBookingDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const profile = await this.profileModel.findOne({ bookingSlug: slug });
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

    // Upsert customer: same email = same person
    let customer = await this.customerModel.findOne({ email: dto.email });
    if (!customer) {
      customer = await this.customerModel.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      });
    }

    const shootDate = new Date(dto.date);
    shootDate.setUTCHours(0, 0, 0, 0);

    const reservation = await this.reservationModel.create({
      customerId: customer._id,
      photographerId: profile.userId,
      date: shootDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      eventType: dto.eventType,
      location: dto.location,
      customerNotes: dto.notes,
      status: ReservationStatus.PENDING,
      reservationToken: crypto.randomBytes(32).toString('hex'),
    });

    return {
      reservationToken: reservation.reservationToken,
      message: 'Reservation request submitted successfully',
    };
  }

  async trackReservation(token: string) {
    const reservation = await this.reservationModel
      .findOne({ reservationToken: token })
      .populate<{ customerId: Customer }>('customerId', 'firstName lastName email')
      .populate<{ photographerId: User }>('photographerId', 'firstName lastName');

    if (!reservation) throw new NotFoundException('Reservation not found');

    return {
      status: reservation.status,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      eventType: reservation.eventType,
      location: reservation.location,
      photographer: {
        firstName: (reservation.photographerId as User).firstName,
        lastName: (reservation.photographerId as User).lastName,
      },
    };
  }
}
