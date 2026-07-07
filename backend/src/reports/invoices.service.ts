import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { InvoiceGenerationService } from './invoice-generation.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly invoiceGenerationService: InvoiceGenerationService,
  ) {}

  async getInvoices(photographerId: string, page = 1, limit = 10, search = '') {
    const qb = this.reservationRepository
      .createQueryBuilder('reservation')
      .select('reservation.id', 'id')
      .addSelect('reservation.totalAmountInCents', 'totalAmountInCents')
      .addSelect('COALESCE(SUM(payments.amountInCents), 0)', 'totalPaid')
      .leftJoin('reservation.customer', 'customer')
      .leftJoin(
        'reservation.payments',
        'payments',
        'payments.status = :paymentStatus',
        { paymentStatus: PaymentStatus.SUCCESS },
      )
      .where('reservation.photographerId = :photographerId', { photographerId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED],
      })
      .groupBy('reservation.id')
      .addGroupBy('reservation.totalAmountInCents');

    if (search) {
      qb.andWhere(
        '(LOWER(customer.firstName) || " " || LOWER(customer.lastName) LIKE LOWER(:search) OR LOWER(customer.email) LIKE LOWER(:search) OR LOWER(reservation.eventType) LIKE LOWER(:search) OR LOWER(reservation.id) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const aggregated = await qb.getRawMany();

    let fullyPaidIds = aggregated
      .filter((row) => row.totalPaid >= (row.totalAmountInCents || 1))
      .map((row) => row.id);

    const totalInvoiced = aggregated
      .filter((row) => row.totalPaid >= (row.totalAmountInCents || 1))
      .reduce((sum, row) => sum + (row.totalAmountInCents || 0) / 100, 0);
    const totalSettled = aggregated
      .filter((row) => row.totalPaid >= (row.totalAmountInCents || 1))
      .reduce((sum, row) => sum + row.totalPaid / 100, 0);
    const outstanding = Math.max(0, totalInvoiced - totalSettled);
    const kpis = { totalInvoiced, totalSettled, outstanding };

    const total = fullyPaidIds.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedIds = fullyPaidIds.slice((page - 1) * limit, page * limit);

    if (paginatedIds.length === 0) {
      return { data: [], total, page, totalPages, kpis };
    }

    const reservations = await this.reservationRepository.find({
      where: { id: In(paginatedIds) },
      relations: { customer: true, payments: true },
      order: { date: 'DESC' },
    });

    const data = reservations.map((res) => {
      const resPayments = (res.payments || []).filter(
        (p) => p.status === PaymentStatus.SUCCESS,
      );
      const totalPaid = resPayments.reduce(
        (sum, p) => sum + p.amountInCents,
        0,
      );
      return {
        reservation: res,
        payments: resPayments,
        totalPaidLkr: totalPaid / 100,
        totalValueLkr: (res.totalAmountInCents || 0) / 100,
        isFullyPaid: true,
      };
    });

    return { data, total, page, totalPages, kpis };
  }

  async getSettings(photographerId: string) {
    const profile = await this.profileRepository.findOne({
      where: { userId: photographerId },
    });

    if (!profile) {
      throw new NotFoundException('Photographer profile not found');
    }

    return {
      invoiceTitle: profile.invoiceTitle || 'INVOICE',
      invoiceColor: profile.invoiceColor || '#2563eb',
      invoiceNotes:
        profile.invoiceNotes ||
        'Thank you for booking with us! We appreciate your trust.',
      invoiceLogoText: profile.invoiceLogoText || '',
      invoicePhone: profile.invoicePhone || '',
      invoiceTaxRate: profile.invoiceTaxRate || 0,
      invoiceInstructions: profile.invoiceInstructions || '',
    };
  }

  async updateSettings(photographerId: string, body: any) {
    const profile = await this.profileRepository.findOne({
      where: { userId: photographerId },
    });

    if (!profile) {
      throw new NotFoundException('Photographer profile not found');
    }

    if (body.invoiceTitle !== undefined)
      profile.invoiceTitle = body.invoiceTitle;
    if (body.invoiceColor !== undefined)
      profile.invoiceColor = body.invoiceColor;
    if (body.invoiceNotes !== undefined)
      profile.invoiceNotes = body.invoiceNotes;
    if (body.invoiceLogoText !== undefined)
      profile.invoiceLogoText = body.invoiceLogoText;
    if (body.invoicePhone !== undefined)
      profile.invoicePhone = body.invoicePhone;
    if (body.invoiceTaxRate !== undefined)
      profile.invoiceTaxRate = Number(body.invoiceTaxRate || 0);
    if (body.invoiceInstructions !== undefined)
      profile.invoiceInstructions = body.invoiceInstructions;

    await this.profileRepository.save(profile);
    return this.getSettings(photographerId);
  }

  async generateInvoicePdfDoc(reservationId: string, photographerId?: string) {
    return this.invoiceGenerationService.generateInvoicePdfDoc(
      reservationId,
      photographerId,
    );
  }

  async generateInvoicePdfDocByToken(token: string) {
    return this.invoiceGenerationService.generateInvoicePdfDocByToken(token);
  }

  async resendInvoice(reservationId: string, photographerId: string) {
    return this.invoiceGenerationService.resendInvoice(
      reservationId,
      photographerId,
    );
  }
}
