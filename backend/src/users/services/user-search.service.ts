import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class UserSearchService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

    // RBAC: Admins can see Photographers and Studios for approval
    if (callerRole === UserRole.ADMIN) {
      if (query.role && (query.role === UserRole.PHOTOGRAPHER || query.role === UserRole.STUDIO)) {
        qb.andWhere('user.role = :role', { role: query.role });
      } else {
        qb.andWhere('user.role IN (:...roles)', {
          roles: [UserRole.PHOTOGRAPHER, UserRole.STUDIO],
        });
      }
    } else if (query.role && query.role !== 'ALL') {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (
      query.status !== undefined &&
      query.status !== '' &&
      query.status !== 'ALL'
    ) {
      const isActive = query.status === 'active';
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    if (query.search) {
      const searchPattern = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.phone) LIKE :search OR LOWER(user.studioName) LIKE :search)',
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

  async findOneById(id: string, callerRole: UserRole) {
    if (callerRole !== UserRole.SUPER_ADMIN && callerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      callerRole === UserRole.ADMIN &&
      user.role !== UserRole.PHOTOGRAPHER &&
      user.role !== UserRole.STUDIO
    ) {
      throw new ForbiddenException('Admins can only view Photographers and Studios.');
    }

    return user;
  }
}
