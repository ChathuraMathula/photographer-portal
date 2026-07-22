import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsAggregationService } from './services/reports-aggregation.service';
import { ReportsExportService } from './services/reports-export.service';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Payment, User])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsAggregationService, ReportsExportService],
  exports: [ReportsService, ReportsAggregationService, ReportsExportService],
})
export class ReportsModule {}
