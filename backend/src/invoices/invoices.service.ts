import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { InvoiceGenerationService } from './services/invoice-generation.service';

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

  async getInvoices(
    photographerId: string,
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'date',
    sortOrder = 'DESC',
    filterDate = '',
  ) {
    const qb = this.reservationRepository
      .createQueryBuilder('reservation')
      .select('reservation.id', 'id')
      .addSelect('reservation.totalAmountInCents', 'totalAmountInCents')
      .addSelect('COALESCE(SUM(payments.amountInCents), 0)', 'totalPaid')
      .addSelect('reservation.date', 'date')
      .addSelect('reservation.eventType', 'eventType')
      .addSelect('customer.firstName', 'firstName')
      .addSelect('customer.lastName', 'lastName')
      .addSelect('customer.email', 'email')
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
      .addGroupBy('reservation.totalAmountInCents')
      .addGroupBy('reservation.date')
      .addGroupBy('reservation.eventType')
      .addGroupBy('customer.id')
      .addGroupBy('customer.firstName')
      .addGroupBy('customer.lastName')
      .addGroupBy('customer.email');

    if (filterDate) {
      qb.andWhere('reservation.date = :filterDate', { filterDate });
    }

    const aggregated = await qb.getRawMany();

    // In-memory search filter (avoids PostgreSQL camelCase column quoting issues)
    const searchLower = search.trim().toLowerCase();
    const searchFiltered = searchLower
      ? aggregated.filter((row) => {
          const fullName = `${row.firstName || ''} ${row.lastName || ''}`.toLowerCase();
          return (
            fullName.includes(searchLower) ||
            (row.email || '').toLowerCase().includes(searchLower) ||
            (row.eventType || '').toLowerCase().includes(searchLower) ||
            (row.id || '').toLowerCase().includes(searchLower)
          );
        })
      : aggregated;

    const fullyPaidRows = searchFiltered.filter(
      (row) => Number(row.totalPaid) >= (Number(row.totalAmountInCents) || 1),
    );

    const totalInvoiced = fullyPaidRows.reduce(
      (sum, row) => sum + (Number(row.totalAmountInCents) || 0) / 100,
      0,
    );
    const totalSettled = fullyPaidRows.reduce(
      (sum, row) => sum + Number(row.totalPaid) / 100,
      0,
    );
    const outstanding = Math.max(0, totalInvoiced - totalSettled);
    const kpis = { totalInvoiced, totalSettled, outstanding };

    // Sort in-memory
    if (sortBy === 'name') {
      fullyPaidRows.sort((a, b) => {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
        if (sortOrder === 'ASC') return nameA.localeCompare(nameB);
        return nameB.localeCompare(nameA);
      });
    } else {
      // Default: date
      fullyPaidRows.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (sortOrder === 'ASC') return dateA - dateB;
        return dateB - dateA;
      });
    }

    const total = fullyPaidRows.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedRows = fullyPaidRows.slice((page - 1) * limit, page * limit);
    const paginatedIds = paginatedRows.map((row) => row.id);

    if (paginatedIds.length === 0) {
      return { data: [], total, page, totalPages, kpis };
    }

    const reservations = await this.reservationRepository.find({
      where: { id: In(paginatedIds) },
      relations: { customer: true, payments: true },
    });

    // Sort to match paginatedIds order
    reservations.sort((a, b) => paginatedIds.indexOf(a.id) - paginatedIds.indexOf(b.id));

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

  async getOrCreateInvoicePdf(reservationId: string, photographerId?: string) {
    return this.invoiceGenerationService.getOrCreateInvoicePdf(
      reservationId,
      photographerId,
    );
  }

  async getOrCreateInvoicePdfByToken(token: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.invoiceGenerationService.getOrCreateInvoicePdf(reservation.id);
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
