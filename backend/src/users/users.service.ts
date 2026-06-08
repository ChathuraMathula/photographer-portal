import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../schemas/user.schema';
import { PhotographerProfile } from '../schemas/photographer-profile.schema';
import { CreatePhotographerDto } from './dto/create-photographer.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PhotographerProfile.name)
    private profileModel: Model<PhotographerProfile>,
  ) {}

  async createPhotographer(dto: CreatePhotographerDto, baseUrl: string) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: UserRole.PHOTOGRAPHER,
      isActive: true,
      phone: dto.phone,
    });

    const slug = await this.resolveSlug(
      dto.bookingSlug ?? this.buildSlug(dto.firstName, dto.lastName),
    );

    await this.profileModel.create({
      userId: user._id,
      bookingSlug: slug,
      bio: dto.bio,
      baseLocation: dto.baseLocation,
      specializations: dto.specializations ?? [],
      isAvailableForBooking: true,
    });

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bookingLink: `${baseUrl}/book/${slug}`,
    };
  }

  async listPhotographers() {
    return this.userModel
      .find({ role: UserRole.PHOTOGRAPHER, isActive: true })
      .select('-passwordHash')
      .lean();
  }

  private buildSlug(firstName: string, lastName: string): string {
    return `${firstName}-${lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async resolveSlug(base: string): Promise<string> {
    let slug = base;
    let i = 1;
    while (await this.profileModel.exists({ bookingSlug: slug })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }
}
