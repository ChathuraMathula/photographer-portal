import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Reservation } from '../entities/reservation.entity';
import { CreateStudioPhotographerDto } from './dto/create-studio-photographer.dto';
import { UserSlugService } from '../users/services/user-slug.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class StudiosService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly slugService: UserSlugService,
    private readonly auditLogsService: AuditLogsService,
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

    const studioItems = await Promise.all(
      studios.map(async (studio) => {
        const profile = await this.profileRepository.findOneBy({ userId: studio.id });
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
          city: profile?.city,
          district: profile?.district,
          baseLocation: profile?.baseLocation,
          description: profile?.bio,
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
    const cleanSlug = slug.toLowerCase().trim();
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.studioSlug) = :cleanSlug', { cleanSlug })
      .orWhere('LOWER(user.username) = :cleanSlug', { cleanSlug });

    if (isUuid) {
      qb.orWhere('user.id = :slug', { slug });
    }

    let studio = await qb.getOne();

    if (!studio) {
      const profile = await this.profileRepository.findOne({
        where: { bookingSlug: cleanSlug },
        relations: { user: true },
      });
      if (profile?.user && profile.user.role === UserRole.STUDIO) {
        studio = profile.user;
      }
    }

    if (!studio || studio.role !== UserRole.STUDIO) {
      throw new NotFoundException('Studio not found');
    }

    const profile = await this.profileRepository.findOneBy({ userId: studio.id });

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
      city: profile?.city,
      district: profile?.district,
      baseLocation: profile?.baseLocation,
      locationMapLink: profile?.locationMapLink,
      description: profile?.bio,
      subscriptionPlan: studio.subscriptionPlan,
      photographers: photographers.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        bookingSlug: p.profile?.bookingSlug || p.username || p.id,
        bio: p.profile?.bio,
        profileImageUrl: p.profile?.profileImageUrl,
        specializations: p.profile?.specializations || [],
        rating: p.profile?.rating || 4.8,
        ratingCount: p.profile?.ratingCount || 12,
        isAvailableForBooking: p.profile?.isAvailableForBooking ?? true,
      })),
    };
  }

  async createStudioPhotographer(
    studioUserId: string,
    dto: CreateStudioPhotographerDto,
  ) {
    const studio = await this.userRepository.findOneBy({ id: studioUserId });
    if (!studio || studio.role !== UserRole.STUDIO) {
      throw new ForbiddenException('Only verified Studios can add team photographers.');
    }

    // Check capacity quota
    const currentCount = await this.userRepository.count({
      where: { studioId: studioUserId, isActive: true },
    });

    if (currentCount >= studio.maxPhotographers) {
      throw new ForbiddenException(
        `You have reached the maximum photographer limit (${studio.maxPhotographers}) for your ${studio.subscriptionPlan} plan. Upgrade your plan to add more team members.`,
      );
    }

    const cleanUsername = dto.username.toLowerCase().trim().replace(/^@/, '');
    const rawSlug = dto.bookingSlug || cleanUsername || `${dto.firstName}-${dto.lastName}`;
    const cleanSlug = this.slugService.slugify(rawSlug);

    const existingEmail = await this.userRepository.findOneBy({ email: dto.email });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const existingUsername = await this.userRepository.findOneBy({ username: cleanUsername });
    if (existingUsername) {
      throw new ConflictException(`Username "@${cleanUsername}" is already taken.`);
    }

    const existingSlug = await this.profileRepository.findOneBy({ bookingSlug: cleanSlug });
    if (existingSlug) {
      throw new ConflictException(`Booking slug "${cleanSlug}" is already taken.`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const assignedRole =
      dto.role === UserRole.STUDIO_STAFF
        ? UserRole.STUDIO_STAFF
        : UserRole.STUDIO_PHOTOGRAPHER;

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      username: cleanUsername,
      passwordHash,
      role: assignedRole,
      studioId: studioUserId,
      studioName: studio.studioName,
      studioLogoUrl: studio.studioLogoUrl,
      studioSlug: studio.studioSlug,
      isActive: true,
      phone: dto.phone,
      subscriptionPlan: studio.subscriptionPlan,
    });
    await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: user.id,
      bookingSlug: cleanSlug,
      bio: dto.bio,
      specializations: dto.specializations ?? [],
      isAvailableForBooking: true,
    });
    await this.profileRepository.save(profile);

    await this.auditLogsService.logAction(
      'STUDIO_PHOTOGRAPHER_CREATED',
      `Studio ${studio.studioName} added photographer ${user.email} (@${cleanUsername})`,
      user.id,
      user.email,
    );

    return {
      message: 'Photographer added successfully to your studio team!',
      photographer: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: `@${cleanUsername}`,
        bookingSlug: cleanSlug,
      },
    };
  }

  async getStudioPhotographers(studioUserId: string) {
    const studio = await this.userRepository.findOneBy({ id: studioUserId });
    if (!studio) throw new NotFoundException('Studio not found');

    const photographers = await this.userRepository.find({
      where: { studioId: studioUserId },
      relations: { profile: true },
    });

    const currentCount = photographers.filter((p) => p.isActive).length;

    return {
      capacity: {
        used: currentCount,
        max: studio.maxPhotographers,
        plan: studio.subscriptionPlan,
      },
      photographers: photographers.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        username: p.username ? `@${p.username}` : undefined,
        phone: p.phone,
        isActive: p.isActive,
        role: p.role,
        bookingSlug: p.profile?.bookingSlug,
        bio: p.profile?.bio,
        specializations: p.profile?.specializations || [],
        isPublishedToGlobalShowcase: p.isPublishedToGlobalShowcase,
      })),
    };
  }

  async assignReservationToStaff(
    studioUserId: string,
    reservationId: string,
    assignedPhotographerId: string | null,
  ) {
    const reservation = await this.userRepository.manager.getRepository(Reservation).findOne({
      where: { id: reservationId, photographerId: studioUserId },
      relations: { customer: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found for this studio');
    }

    if (assignedPhotographerId) {
      const staffUser = await this.userRepository.findOne({
        where: { id: assignedPhotographerId, studioId: studioUserId },
      });
      if (!staffUser) {
        throw new NotFoundException('Photographer is not registered under your studio');
      }
      reservation.assignedPhotographerId = staffUser.id;
    } else {
      reservation.assignedPhotographerId = undefined;
    }

    await this.userRepository.manager.getRepository(Reservation).save(reservation);

    await this.auditLogsService.logAction(
      'STUDIO_RESERVATION_ASSIGNED',
      `Assigned reservation ${reservationId} to photographer ${assignedPhotographerId || 'Unassigned'}`,
      studioUserId,
      '',
    );

    return {
      message: 'Reservation staff assignment updated successfully',
      reservation,
    };
  }
}
