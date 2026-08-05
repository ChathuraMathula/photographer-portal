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
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Self-registered accounts start inactive (pending approval)
    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: UserRole.PHOTOGRAPHER,
      isActive: false,
      phone: dto.phone,
      subscriptionPlan: 'FREE',
    });
    await this.userRepository.save(user);

    // Create profile
    const slug = await this.slugService.resolveSlug(
      this.slugService.buildSlug(dto.firstName, dto.lastName),
    );

    const profile = this.profileRepository.create({
      userId: user.id,
      bookingSlug: slug,
      bio: dto.bio,
      city: dto.city,
      specializations: dto.specializations ?? [],
      isAvailableForBooking: false,
    });
    await this.profileRepository.save(profile);

    await this.auditLogsService.logAction(
      'USER_SELF_REGISTERED',
      `Photographer ${user.email} registered (pending admin review)`,
      user.id,
      user.email,
    );

    return {
      message:
        'Registration submitted successfully! Your photographer account is currently pending review by a SeyaRoo administrator.',
      pendingApproval: true,
    };
  }

  async registerStudio(dto: RegisterStudioDto) {
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const studioSlug = await this.slugService.resolveSlug(
      this.slugService.buildSlug(dto.studioName, ''),
    );

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      studioName: dto.studioName,
      studioSlug: studioSlug,
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
      `Studio ${dto.studioName} (${user.email}) registered (pending admin review)`,
      user.id,
      user.email,
    );

    return {
      message:
        'Studio registration submitted successfully! Your studio account is currently pending review by a SeyaRoo administrator.',
      pendingApproval: true,
    };
  }
}
