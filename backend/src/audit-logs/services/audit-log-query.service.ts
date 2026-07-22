import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogQueryService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getLogs(filters: {
    page?: number;
    limit?: number;
    action?: string;
    userEmail?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      action,
      userEmail,
      startDate,
      endDate,
    } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (userEmail) {
      where.userEmail = userEmail;
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      where.createdAt = Between(start, end);
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
