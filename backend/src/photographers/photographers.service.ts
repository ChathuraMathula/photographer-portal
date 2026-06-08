import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';
import { PhotographerProfile } from '../schemas/photographer-profile.schema';

@Injectable()
export class PhotographersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PhotographerProfile.name)
    private profileModel: Model<PhotographerProfile>,
  ) {}

  async findAll() {
    return this.profileModel.find().populate('userId', '-passwordHash').lean();
  }

  async findOne(userId: string) {
    const profile = await this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', '-passwordHash');

    if (!profile) throw new NotFoundException('Photographer profile not found');
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<PhotographerProfile>) {
    const allowed = [
      'bio',
      'specializations',
      'portfolioUrl',
      'profileImageUrl',
      'baseLocation',
      'isAvailableForBooking',
    ];
    const safe = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k)),
    );

    const profile = await this.profileModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: safe },
      { new: true },
    );

    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getBookingLink(userId: string, baseUrl: string) {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return { bookingLink: `${baseUrl}/book/${profile.bookingSlug}` };
  }

  async toggleAvailability(userId: string) {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile) throw new NotFoundException('Profile not found');
    profile.isAvailableForBooking = !profile.isAvailableForBooking;
    return profile.save();
  }
}
