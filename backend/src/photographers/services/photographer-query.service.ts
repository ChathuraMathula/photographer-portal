import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';

@Injectable()
export class PhotographerQueryService {
  constructor(
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
  ) {}

  async findAll() {
    const profiles = await this.profileRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
    return profiles.map((p) => {
      if (p.user) {
        delete (p.user as any).passwordHash;
      }
      return p;
    });
  }

  async findOne(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: { user: true },
    });

    if (!profile) throw new NotFoundException('Photographer profile not found');
    if (profile.user) {
      delete (profile.user as any).passwordHash;
    }
    return profile;
  }

  async getBookingLink(userId: string, baseUrl: string) {
    const profile = await this.profileRepository.findOneBy({ userId });
    if (!profile) throw new NotFoundException('Profile not found');
    return { bookingLink: `${baseUrl}/book/${profile.bookingSlug}` };
  }
}
