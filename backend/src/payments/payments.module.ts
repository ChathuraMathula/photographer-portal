import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Reservation, Payment, PhotographerProfile]),
    ReservationsModule,
    EmailModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
