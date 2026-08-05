import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { RegisterPhotographerDto } from '../dto/register-photographer.dto';
import { RegisterStudioDto } from '../dto/register-studio.dto';
import { UserSlugService } from '../../users/services/user-slug.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class AuthRegisterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly slugService: UserSlugService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async registerPhotographer(dto: RegisterPhotographerDto) {
    const cleanUsername = dto.username.toLowerCase().trim().replace(/^@/, '');
    const cleanSlug = this.slugService.slugify(dto.bookingSlug);

    // Uniqueness checks
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

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      username: cleanUsername,
      passwordHash,
      role: UserRole.PHOTOGRAPHER,
      isActive: false,
      phone: dto.phone,
      subscriptionPlan: 'FREE',
    });
    await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: user.id,
      bookingSlug: cleanSlug,
      bio: dto.bio,
      city: dto.city,
      specializations: dto.specializations ?? [],
      isAvailableForBooking: false,
    });
    await this.profileRepository.save(profile);

    await this.auditLogsService.logAction(
      'USER_SELF_REGISTERED',
      `Photographer ${user.email} (@${cleanUsername}) registered (pending admin review)`,
      user.id,
      user.email,
    );

    return {
      message:
        'Registration submitted successfully! Your photographer account is currently pending review by a SeyaRoo administrator.',
      pendingApproval: true,
      username: `@${cleanUsername}`,
      bookingSlug: cleanSlug,
    };
  }

  async registerStudio(dto: RegisterStudioDto) {
    const cleanUsername = dto.username.toLowerCase().trim().replace(/^@/, '');
    const cleanSlug = this.slugService.slugify(dto.studioSlug);

    const existingEmail = await this.userRepository.findOneBy({ email: dto.email });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const existingUsername = await this.userRepository.findOneBy({ username: cleanUsername });
    if (existingUsername) {
      throw new ConflictException(`Username "@${cleanUsername}" is already taken.`);
    }

    const existingStudioSlug = await this.userRepository.findOneBy({ studioSlug: cleanSlug });
    if (existingStudioSlug) {
      throw new ConflictException(`Studio slug "${cleanSlug}" is already taken.`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      studioName: dto.studioName,
      studioSlug: cleanSlug,
      username: cleanUsername,
      email: dto.email,
      passwordHash,
      role: UserRole.STUDIO,
      isActive: false,
      phone: dto.phone,
      subscriptionPlan: 'FREE',
      maxPhotographers: 5,
    });
    await this.userRepository.save(user);

    await this.auditLogsService.logAction(
      'STUDIO_SELF_REGISTERED',
      `Studio ${dto.studioName} (${user.email}, @${cleanUsername}) registered (pending admin review)`,
      user.id,
      user.email,
    );

    return {
      message:
        'Studio registration submitted successfully! Your studio account is currently pending review by a SeyaRoo administrator.',
      pendingApproval: true,
      username: `@${cleanUsername}`,
      studioSlug: cleanSlug,
    };
  }

  async checkAvailability(query: { email?: string; username?: string; bookingSlug?: string }) {
    const result = {
      emailAvailable: true,
      usernameAvailable: true,
      bookingSlugAvailable: true,
      messages: [] as string[],
    };

    if (query.email?.trim()) {
      const existingEmail = await this.userRepository.findOneBy({ email: query.email.trim() });
      if (existingEmail) {
        result.emailAvailable = false;
        result.messages.push('An account with this email address already exists.');
      }
    }

    if (query.username?.trim()) {
      const cleanUsername = query.username.toLowerCase().trim().replace(/^@/, '');
      const existingUsername = await this.userRepository.findOneBy({ username: cleanUsername });
      if (existingUsername) {
        result.usernameAvailable = false;
        result.messages.push(`Username "@${cleanUsername}" is already taken.`);
      }
    }

    if (query.bookingSlug?.trim()) {
      const cleanSlug = this.slugService.slugify(query.bookingSlug);
      const existingSlug = await this.profileRepository.findOneBy({ bookingSlug: cleanSlug });
      const existingStudioSlug = await this.userRepository.findOneBy({ studioSlug: cleanSlug });
      if (existingSlug || existingStudioSlug) {
        result.bookingSlugAvailable = false;
        result.messages.push(`Booking slug "${cleanSlug}" is already taken.`);
      }
    }

    return result;
  }
}
