import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ChatGateway],
  exports: [ReservationsService, ChatGateway],
})
export class ReservationsModule {}
