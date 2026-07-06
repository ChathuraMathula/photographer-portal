import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ChatGateway } from './chat.gateway';
import { ReservationsQuotationService } from './reservations-quotation.service';
import { ReservationsLifecycleService } from './reservations-lifecycle.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ChatGateway, ReservationsQuotationService, ReservationsLifecycleService],
  exports: [ReservationsService, ChatGateway, ReservationsQuotationService, ReservationsLifecycleService],
})
export class ReservationsModule {}
