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

  async findPublicPaginated(page = 1, limit = 6, search?: string) {
    const skip = (page - 1) * limit;

    const query = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('(user.isActive = :active OR user.isActive IS NULL)', { active: true });

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(profile.bio) LIKE :q OR LOWER(profile.city) LIKE :q OR LOWER(profile.district) LIKE :q)',
        { q },
      );
    }

    const [profiles, total] = await query
      .orderBy('profile.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const items = profiles.map((p) => {
      if (p.user) {
        delete (p.user as any).passwordHash;
      }
      return p;
    });

    const hasMore = skip + items.length < total;

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        hasMore,
      },
    };
  }

  async getBookingLink(userId: string, baseUrl: string) {
    const profile = await this.profileRepository.findOneBy({ userId });
    if (!profile) throw new NotFoundException('Profile not found');
    return { bookingLink: `${baseUrl}/book/${profile.bookingSlug}` };
  }
}
