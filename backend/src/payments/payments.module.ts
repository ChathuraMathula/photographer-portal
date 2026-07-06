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
import { StripeHelperService } from './stripe-helper.service';
import { OfflinePaymentService } from './offline-payment.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Reservation, Payment, PhotographerProfile]),
    ReservationsModule,
    EmailModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeHelperService, OfflinePaymentService],
  exports: [PaymentsService, StripeHelperService, OfflinePaymentService],
})
export class PaymentsModule {}
