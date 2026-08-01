import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ChatGateway } from './chat.gateway';
import { ReservationsQuotationService } from './services/reservations-quotation.service';
import { ReservationsLifecycleService } from './services/reservations-lifecycle.service';
import { ReservationsQueryService } from './services/reservations-query.service';
import { ReservationsChatService } from './services/reservations-chat.service';
import { ReservationsNotificationService } from './services/reservations-notification.service';
import { ChatWorkerGateway } from './chat-worker.gateway';
import { ChatController } from './chat.controller';
import { LockedDatesService } from './locked-dates.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController, ChatController],
  providers: [
    ReservationsService,
    ChatGateway,
    ChatWorkerGateway,
    ReservationsQuotationService,
    ReservationsLifecycleService,
    ReservationsQueryService,
    ReservationsChatService,
    ReservationsNotificationService,
    LockedDatesService,
  ],
  exports: [
    ReservationsService,
    ChatGateway,
    ReservationsQuotationService,
    ReservationsLifecycleService,
    ReservationsQueryService,
    ReservationsChatService,
    ReservationsNotificationService,
    LockedDatesService,
  ],
})
export class ReservationsModule {}
