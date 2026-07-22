import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { PhotographerProfile } from '../../entities/photographer-profile.entity';
import { generateInvoicePdf, InvoiceData } from '../pdf/invoices-pdf-generator';
import { EmailService } from '../../email/email.service';

@Injectable()
export class InvoiceGenerationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PhotographerProfile)
    private readonly profileRepository: Repository<PhotographerProfile>,
    private readonly emailService: EmailService,
  ) {}

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
