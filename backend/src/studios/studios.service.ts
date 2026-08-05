import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class StudiosService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findPublicPaginated(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.STUDIO })
      .andWhere('user.isActive = :active', { active: true });

    if (query.search) {
      qb.andWhere(
        '(LOWER(user.studioName) LIKE :search OR LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [studios, total] = await qb.getManyAndCount();

    // Attach photographer counts for each studio
    const studioItems = await Promise.all(
      studios.map(async (studio) => {
        const photographerCount = await this.userRepository.count({
          where: { studioId: studio.id, isActive: true },
        });

        return {
          id: studio.id,
          studioName: studio.studioName || `${studio.firstName}'s Studio`,
          studioSlug: studio.studioSlug || studio.id,
          studioLogoUrl: studio.studioLogoUrl,
          managerName: `${studio.firstName} ${studio.lastName}`,
          email: studio.email,
          phone: studio.phone,
          subscriptionPlan: studio.subscriptionPlan,
          photographerCount,
          createdAt: studio.createdAt,
        };
      }),
    );

    return {
      data: studioItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const studio = await this.userRepository.findOne({
      where: [
        { studioSlug: slug, role: UserRole.STUDIO, isActive: true },
        { id: slug, role: UserRole.STUDIO, isActive: true },
      ],
    });

    if (!studio) {
      throw new NotFoundException('Studio not found');
    }

    // Get photographers under this studio
    const photographers = await this.userRepository.find({
      where: { studioId: studio.id, isActive: true },
      relations: { profile: true },
    });

    return {
      id: studio.id,
      studioName: studio.studioName || `${studio.firstName}'s Studio`,
      studioSlug: studio.studioSlug || studio.id,
      studioLogoUrl: studio.studioLogoUrl,
      managerName: `${studio.firstName} ${studio.lastName}`,
      email: studio.email,
      phone: studio.phone,
      subscriptionPlan: studio.subscriptionPlan,
      photographers: photographers.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        bookingSlug: p.profile?.bookingSlug,
        bio: p.profile?.bio,
        profileImageUrl: p.profile?.profileImageUrl,
        specializations: p.profile?.specializations || [],
        rating: p.profile?.rating || 5.0,
        ratingCount: p.profile?.ratingCount || 0,
        isAvailableForBooking: p.profile?.isAvailableForBooking ?? true,
      })),
    };
  }
}
