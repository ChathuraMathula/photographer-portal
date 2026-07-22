import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogWriterService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
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
}
