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
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../email/email.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ChatGateway } from '../reservations/chat.gateway';
import { UserProfileService } from './user-profile.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PhotographerProfile)
    private profileRepository: Repository<PhotographerProfile>,
    private readonly chatGateway: ChatGateway,
    private readonly emailService: EmailService,
    private readonly auditLogsService: AuditLogsService,
    private readonly profileService: UserProfileService,
  ) {}

  async create(dto: CreateUserDto, callerRole: UserRole) {
    // 1. RBAC constraints checking
    if (callerRole === UserRole.ADMIN && dto.role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException('Admins can only create Photographers');
    }

    // 2. Check if email already in use
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Create User
    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: dto.role,
      isActive: true,
      phone: dto.phone,
    });
    await this.userRepository.save(user);

    // 4. Create Profile if user is a PHOTOGRAPHER
    let bookingLink: string | undefined = undefined;
    if (dto.role === UserRole.PHOTOGRAPHER) {
      const slug = await this.resolveSlug(
        dto.bookingSlug ?? this.buildSlug(dto.firstName, dto.lastName),
      );

      const profile = this.profileRepository.create({
        userId: user.id,
        bookingSlug: slug,
        bio: dto.bio,
        baseLocation: dto.baseLocation,
        city: dto.city,
        district: dto.district,
        locationMapLink: dto.locationMapLink,
        specializations: dto.specializations ?? [],
        isAvailableForBooking: true,
      });
      await this.profileRepository.save(profile);

      bookingLink = `/book/${slug}`;
    }

    await this.auditLogsService.logAction(
      'USER_CREATED',
      `User ${user.email} of role ${user.role} was created by admin`,
      user.id,
      user.email,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      bookingLink,
    };
  }

  async getProfile(userId: string) {
    return this.profileService.getProfile(userId);
  }

  async updateProfile(userId: string, updates: any) {
    return this.profileService.updateProfile(userId, updates);
  }

  async findAll(
    callerRole: UserRole,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    } = {},
  ) {
    if (callerRole !== UserRole.SUPER_ADMIN && callerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // RBAC: Admins can only see Photographers
    if (callerRole === UserRole.ADMIN) {
      qb.andWhere('user.role = :role', { role: UserRole.PHOTOGRAPHER });
    } else if (query.role && query.role !== 'ALL') {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.status !== undefined && query.status !== '' && query.status !== 'ALL') {
      const isActive = query.status === 'active';
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    if (query.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.phone) LIKE :search)',
        { search: searchPattern },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleActive(id: string, callerRole: UserRole) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admins can only manage photographers
    if (callerRole === UserRole.ADMIN && user.role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException('Admins can only manage Photographers');
    }

    const wasActive = user.isActive;
    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    // If user was just DEACTIVATED: emit real-time event + send email
    if (wasActive && !user.isActive) {
      // Emit WebSocket event to the user's personal room so they get logged out in real-time
      try {
        this.chatGateway.server.to(`user_${id}`).emit('userDeactivated', {
          userId: id,
          message: 'Your account has been suspended by an administrator.',
        });
      } catch (err) {
        console.error('Failed to emit userDeactivated event:', err);
      }

      // Send deactivation email
      try {
        await this.emailService.sendAccountDeactivated(
          user.email,
          user.firstName,
        );
      } catch (err) {
        console.error('Failed to send account deactivated email:', err);
      }
    }

    await this.auditLogsService.logAction(
      'USER_STATUS_TOGGLED',
      `User ${user.email} active status toggled to ${user.isActive} by admin`,
      user.id,
      user.email,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
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
    while (await this.profileRepository.findOneBy({ bookingSlug: slug })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async getSettings(userId: string) {
    return this.profileService.getSettings(userId);
  }

  async updateSettings(userId: string, updates: any) {
    return this.profileService.updateSettings(userId, updates);
  }

  async updateUserSlug(userId: string, newSlug: string) {
    const profile = await this.profileRepository.findOneBy({ userId });
    if (!profile) {
      throw new NotFoundException('Photographer profile not found');
    }

    if (profile.bookingSlug !== newSlug) {
      const existing = await this.profileRepository.findOneBy({
        bookingSlug: newSlug,
      });
      if (existing) {
        throw new ConflictException('Booking slug is already in use');
      }
      profile.bookingSlug = newSlug;
      await this.profileRepository.save(profile);
      
      await this.auditLogsService.logAction(
        'USER_SLUG_UPDATED',
        `User ${userId} booking slug was updated to ${newSlug} by super admin`,
        userId,
      );
    }
    return { bookingSlug: profile.bookingSlug };
  }
}
