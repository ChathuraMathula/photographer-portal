import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { EmailService } from '../../email/email.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { UserSlugService } from './user-slug.service';

@Injectable()
export class UserCreationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly emailService: EmailService,
    private readonly auditLogsService: AuditLogsService,
    private readonly slugService: UserSlugService,
  ) { }

  async create(dto: CreateUserDto, callerRole: UserRole) {
    // RBAC constraints checking
    if (callerRole === UserRole.ADMIN && dto.role !== UserRole.PHOTOGRAPHER) {
      throw new ForbiddenException('Admins can only create Photographers');
    }

    // Check if email already in use
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create User
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

    // Create Profile if user is a PHOTOGRAPHER
    let bookingLink: string | undefined = undefined;
    if (dto.role === UserRole.PHOTOGRAPHER) {
      const slug = await this.slugService.resolveSlug(
        dto.bookingSlug ?? this.slugService.buildSlug(dto.firstName, dto.lastName),
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

    // Send email notification to newly created user
    try {
      await this.emailService.sendUserCreated(
        user.email,
        user.firstName,
        user.role,
        dto.password,
      );
    } catch (err) {
      console.error('Failed to send user creation email:', err);
    }

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
}
