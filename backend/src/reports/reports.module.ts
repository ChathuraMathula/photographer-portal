import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsAggregationService } from './reports-aggregation.service';
import { ElasticReportsAggregationService } from './elastic-reports-aggregation.service';
import { AnalyticsSyncService } from './analytics-sync.service';
import { AnalyticsSyncSubscriber } from './analytics-sync.subscriber';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Payment, User]),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService, 
    ReportsAggregationService,
    ElasticReportsAggregationService,
    AnalyticsSyncService,
    AnalyticsSyncSubscriber
  ],
})
export class ReportsModule {}
