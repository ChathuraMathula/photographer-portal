import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentProcessorService } from './services/payment-processor.service';
import { PaymentQueryService } from './services/payment-query.service';
import { OfflinePaymentService } from './services/offline-payment.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly processorService: PaymentProcessorService,
    private readonly queryService: PaymentQueryService,
    private readonly offlinePaymentService: OfflinePaymentService,
  ) {}

  async processPayment(dto: ProcessPaymentDto) {
    return this.processorService.processPayment(dto);
  }

  async manualFulfillPayment(reservationId: string, photographerId: string) {
    return this.offlinePaymentService.fulfillOfflinePayment(
      reservationId,
      photographerId,
      this.reservationRepository,
      this.paymentRepository,
      this.profileRepository,
    );
  }

  async getPhotographerTransactions(
    photographerId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      method?: string;
      sortBy?: string;
      sortOrder?: string;
      filterDate?: string;
    } = {},
  ) {
    return this.queryService.getPhotographerTransactions(photographerId, query);
  }

  async getReservationPayments(reservationId: string, userId: string) {
    return this.queryService.getReservationPayments(reservationId, userId);
  }
}
