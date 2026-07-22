import { Injectable } from '@nestjs/common';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogWriterService } from './services/audit-log-writer.service';
import { AuditLogQueryService } from './services/audit-log-query.service';

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly writerService: AuditLogWriterService,
    private readonly queryService: AuditLogQueryService,
  ) {}

  async logAction(
    action: string,
    details: string,
    userId?: string,
    userEmail?: string,
  ): Promise<AuditLog> {
    return this.writerService.logAction(action, details, userId, userEmail);
  }

  async getLogs(filters: {
    page?: number;
    limit?: number;
    action?: string;
    userEmail?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.queryService.getLogs(filters);
  }
}
