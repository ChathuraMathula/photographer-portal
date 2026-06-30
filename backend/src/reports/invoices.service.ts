import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { generateInvoicePdf, InvoiceData } from './invoices-pdf-generator';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly emailService: EmailService,
  ) {}

  async getInvoices(photographerId: string, page = 1, limit = 10, search = '') {
    // We want reservations that are CONFIRMED or COMPLETED and fully paid.
    // In SQLite, filtering by HAVING SUM(payments) >= totalAmountInCents is tricky if we want to return full entities.
    // A robust way for SQLite is to query the reservation IDs that meet the criteria, then fetch the entities.
    const qb = this.reservationRepository.createQueryBuilder('reservation')
      .select('reservation.id', 'id')
      .addSelect('reservation.totalAmountInCents', 'totalAmountInCents')
      .addSelect('COALESCE(SUM(payments.amountInCents), 0)', 'totalPaid')
      .leftJoin('reservation.customer', 'customer')
      .leftJoin('reservation.payments', 'payments', 'payments.status = :paymentStatus', { paymentStatus: PaymentStatus.SUCCESS })
      .where('reservation.photographerId = :photographerId', { photographerId })
      .andWhere('reservation.status IN (:...statuses)', { statuses: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED] })
      .groupBy('reservation.id')
      .addGroupBy('reservation.totalAmountInCents');

    if (search) {
      qb.andWhere(
        '(LOWER(customer.firstName) || " " || LOWER(customer.lastName) LIKE LOWER(:search) OR LOWER(customer.email) LIKE LOWER(:search) OR LOWER(reservation.eventType) LIKE LOWER(:search) OR LOWER(reservation.id) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    const aggregated = await qb.getRawMany();

    // Filter to fully paid
    let fullyPaidIds = aggregated
      .filter(row => row.totalPaid >= (row.totalAmountInCents || 1))
      .map(row => row.id);

    // Calculate KPIs across all matching invoices (ignoring pagination)
    const totalInvoiced = aggregated.filter(row => row.totalPaid >= (row.totalAmountInCents || 1)).reduce((sum, row) => sum + ((row.totalAmountInCents || 0) / 100), 0);
    const totalSettled = aggregated.filter(row => row.totalPaid >= (row.totalAmountInCents || 1)).reduce((sum, row) => sum + (row.totalPaid / 100), 0);
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
      const resPayments = (res.payments || []).filter(p => p.status === PaymentStatus.SUCCESS);
      const totalPaid = resPayments.reduce((sum, p) => sum + p.amountInCents, 0);
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
    const whereClause: any = { id: reservationId };
    if (photographerId) {
      whereClause.photographerId = photographerId;
    }

    const reservation = await this.reservationRepository.findOne({
      where: whereClause,
      relations: { customer: true, photographer: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const payments = await this.paymentRepository.find({
      where: { reservationId: reservation.id, status: PaymentStatus.SUCCESS },
      order: { createdAt: 'ASC' },
    });

    // Fetch customization settings
    const profile = await this.profileRepository.findOne({
      where: { userId: reservation.photographerId },
    });

    const settings = {
      invoiceTitle: profile?.invoiceTitle || 'INVOICE',
      invoiceColor: profile?.invoiceColor || '#2563eb',
      invoiceNotes:
        profile?.invoiceNotes ||
        'Thank you for booking with us! We appreciate your trust.',
      invoiceLogoText:
        profile?.invoiceLogoText || reservation.photographer.firstName,
      invoicePhone: profile?.invoicePhone || '',
      invoiceInstructions: profile?.invoiceInstructions || '',
    };

    const packages = reservation.selectedPackages || [];
    const selectedPkg = packages.find(
      (p: any) => p.id === reservation.clientSelectedPackageId,
    ) || {
      name: 'Photography Services',
      priceInCents: reservation.totalAmountInCents || 0,
    };

    const taxRate = profile?.invoiceTaxRate || 0;
    const packagePriceLkr =
      (reservation.totalAmountInCents || selectedPkg.priceInCents || 0) / 100;
    const taxAmountLkr = Math.round(packagePriceLkr * (taxRate / 100));
    const grandTotalLkr = packagePriceLkr + taxAmountLkr;
    const totalPaidLkr =
      payments.reduce((sum, p) => sum + p.amountInCents, 0) / 100;
    const balanceDueLkr = Math.max(0, grandTotalLkr - totalPaidLkr);

    const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}-${new Date(reservation.createdAt).getTime().toString().slice(-4)}`;

    const invoiceData: InvoiceData = {
      invoiceNumber,
      issueDate: new Date().toLocaleDateString(),
      clientName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      clientEmail: reservation.customer.email,
      clientPhone: reservation.customer.phone || '',
      photographerName: `${reservation.photographer.firstName} ${reservation.photographer.lastName}`,
      photographerEmail: reservation.photographer.email,
      photographerPhone: '',
      eventDate: reservation.date
        ? reservation.date.toString().split('T')[0]
        : '',
      eventTime: `${reservation.startTime || ''} - ${reservation.endTime || ''}`,
      eventType: reservation.eventType || 'Event',
      location: reservation.location || '',
      packageName: selectedPkg.name,
      packagePriceLkr,
      payments: payments.map((p) => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        method: `${p.cardBrand} (*${p.cardLast4})`,
        amountLkr: p.amountInCents / 100,
        transactionId: p.transactionId,
      })),
      totalPaidLkr,
      balanceDueLkr,
      taxRate,
      taxAmountLkr,
      grandTotalLkr,
      settings,
    };

    return generateInvoicePdf(invoiceData);
  }

  async generateInvoicePdfDocByToken(token: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationToken: token },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.generateInvoicePdfDoc(reservation.id);
  }

  async resendInvoice(reservationId: string, photographerId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId, photographerId },
      relations: { customer: true, photographer: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const pdfDoc = await this.generateInvoicePdfDoc(
      reservation.id,
      photographerId,
    );

    const getPdfBuffer = async (doc: any): Promise<Buffer> => {
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));
        doc.end();
      });
    };

    const pdfBuffer = await getPdfBuffer(pdfDoc);
    const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}-${new Date(reservation.createdAt).getTime().toString().slice(-4)}`;

    await this.emailService.sendInvoice(
      reservation.customer.email,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      invoiceNumber,
      pdfBuffer,
    );

    return { message: 'Invoice email resent successfully.' };
  }
}
