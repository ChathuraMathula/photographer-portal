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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PhotographerProfile)
    private profileRepository: Repository<PhotographerProfile>,
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

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

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
}
