import { ForbiddenException, Injectable } from '@nestjs/common';
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

    // RBAC: Admins can only see Photographers
    if (callerRole === UserRole.ADMIN) {
      qb.andWhere('user.role = :role', { role: UserRole.PHOTOGRAPHER });
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
}
