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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    };
  }

  async updateProfile(userId: string, updates: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.firstName !== undefined) user.firstName = updates.firstName;
    if (updates.lastName !== undefined) user.lastName = updates.lastName;
    if (updates.phone !== undefined) user.phone = updates.phone;

    if (updates.password) {
      user.passwordHash = await bcrypt.hash(updates.password, 10);
    }

    await this.userRepository.save(user);

    await this.auditLogsService.logAction(
      'PROFILE_UPDATED',
      `User ${user.email} updated their profile settings`,
      user.id,
      user.email,
    );

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    };
  }

  async findAll(callerRole: UserRole) {
    if (callerRole === UserRole.SUPER_ADMIN) {
      // Super admin can see all users
      return this.userRepository.find({
        order: { createdAt: 'DESC' },
        relations: { profile: true },
      });
    } else if (callerRole === UserRole.ADMIN) {
      // Admin can only see photographers
      return this.userRepository.find({
        where: { role: UserRole.PHOTOGRAPHER },
        order: { createdAt: 'DESC' },
        relations: { profile: true },
      });
    }
    throw new ForbiddenException('Access denied');
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
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      reminderEmailsEnabled: user.reminderEmailsEnabled,
      inAppNotificationsEnabled: user.inAppNotificationsEnabled,
    };
  }

  async updateSettings(userId: string, updates: any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.emailNotificationsEnabled !== undefined) {
      user.emailNotificationsEnabled = updates.emailNotificationsEnabled;
    }
    if (updates.reminderEmailsEnabled !== undefined) {
      user.reminderEmailsEnabled = updates.reminderEmailsEnabled;
    }
    if (updates.inAppNotificationsEnabled !== undefined) {
      user.inAppNotificationsEnabled = updates.inAppNotificationsEnabled;
    }

    await this.userRepository.save(user);

    await this.auditLogsService.logAction(
      'SETTINGS_UPDATED',
      `User ${user.email} updated their settings (Email: ${user.emailNotificationsEnabled}, Reminders: ${user.reminderEmailsEnabled}, InApp: ${user.inAppNotificationsEnabled})`,
      user.id,
      user.email,
    );

    return {
      emailNotificationsEnabled: user.emailNotificationsEnabled,
      reminderEmailsEnabled: user.reminderEmailsEnabled,
      inAppNotificationsEnabled: user.inAppNotificationsEnabled,
    };
  }
}
