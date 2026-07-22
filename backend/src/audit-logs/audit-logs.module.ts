import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogWriterService } from './services/audit-log-writer.service';
import { AuditLogQueryService } from './services/audit-log-query.service';
import { AuditLogsController } from './audit-logs.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogsService, AuditLogWriterService, AuditLogQueryService],
  controllers: [AuditLogsController],
  exports: [AuditLogsService, AuditLogWriterService, AuditLogQueryService],
})
export class AuditLogsModule {}
