import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationStatus } from '../schemas/reservation.schema';
import { UserRole } from '../schemas/user.schema';

interface JwtUser {
  userId: string;
  role: UserRole;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) {}

  async findAll(user: JwtUser) {
    const filter =
      user.role === UserRole.PHOTOGRAPHER
        ? { photographerId: new Types.ObjectId(user.userId) }
        : {};

    return this.reservationModel
      .find(filter)
      .populate('customerId', 'firstName lastName email phone')
      .populate('photographerId', 'firstName lastName email')
      .sort({ date: 1, startTime: 1 })
      .lean();
  }

  async findOne(id: string, user: JwtUser) {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('customerId', 'firstName lastName email phone address')
      .populate('photographerId', 'firstName lastName email');

    if (!reservation) throw new NotFoundException('Reservation not found');

    if (
      user.role === UserRole.PHOTOGRAPHER &&
      reservation.photographerId.toString() !== user.userId
    ) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async updateStatus(id: string, status: ReservationStatus, user: JwtUser) {
    const reservation = await this.findOne(id, user);
    reservation.status = status;
    return reservation.save();
  }

  async addAdminNote(id: string, note: string, user: JwtUser) {
    const reservation = await this.findOne(id, user);
    reservation.adminNotes = note;
    return reservation.save();
  }
}
