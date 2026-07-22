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
import { StripeHelperService } from './services/stripe-helper.service';
import { OfflinePaymentService } from './services/offline-payment.service';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentQueryService } from './services/payment-query.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Reservation, Payment, PhotographerProfile]),
    ReservationsModule,
    EmailModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeHelperService,
    OfflinePaymentService,
    PaymentProcessorService,
    PaymentQueryService,
  ],
  exports: [
    PaymentsService,
    StripeHelperService,
    OfflinePaymentService,
    PaymentProcessorService,
    PaymentQueryService,
  ],
})
export class PaymentsModule {}
