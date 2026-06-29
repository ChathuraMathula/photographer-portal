import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    details: string,
    userId?: string,
    userEmail?: string,
  ): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      action,
      details,
      userId,
      userEmail,
    });
    return this.auditLogRepository.save(log);
  }

  async getLogs(filters: {
    action?: string;
    userEmail?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    const { action, userEmail, startDate, endDate } = filters;
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

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
}
