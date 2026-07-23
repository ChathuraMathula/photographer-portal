import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
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

  /**
   * Generates or retrieves the invoice PDF from disk.
   * If the file exists on disk, reads it from disk.
   * If missing or not yet generated, generates a new PDF, stores it in backend/uploads/invoices,
   * updates the reservation's invoiceUrl field in DB, and returns the buffer, url, filename, and reservation.
   */
  async getOrCreateInvoicePdf(
    reservationId: string,
    photographerId?: string,
  ): Promise<{
    pdfBuffer: Buffer;
    invoiceUrl: string;
    fileName: string;
    invoiceNumber: string;
    reservation: Reservation;
  }> {
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

    const uploadDir = join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `invoice_${reservation.id}.pdf`;
    const filePath = join(uploadDir, fileName);
    const baseUrl =
      process.env.API_URL ||
      process.env.BACKEND_URL ||
      'http://localhost:4001';
    const invoiceUrl = `${baseUrl}/uploads/invoices/${fileName}`;
    const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}-${new Date(reservation.createdAt).getTime().toString().slice(-4)}`;

    // Check if the file already exists on disk
    if (fs.existsSync(filePath)) {
      const pdfBuffer = fs.readFileSync(filePath);
      if (reservation.invoiceUrl !== invoiceUrl || !reservation.invoiceGeneratedAt) {
        reservation.invoiceUrl = invoiceUrl;
        if (!reservation.invoiceGeneratedAt) {
          reservation.invoiceGeneratedAt = new Date();
        }
        await this.reservationRepository.save(reservation);
      }
      return { pdfBuffer, invoiceUrl, fileName, invoiceNumber, reservation };
    }

    // PDF missing from disk — generate a new one
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

    const pdfDoc = generateInvoicePdf(invoiceData);

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

    // Save generated PDF to disk
    fs.writeFileSync(filePath, pdfBuffer);

    // Update reservation with invoiceUrl and invoiceGeneratedAt in database
    reservation.invoiceUrl = invoiceUrl;
    reservation.invoiceGeneratedAt = new Date();
    await this.reservationRepository.save(reservation);

    return { pdfBuffer, invoiceUrl, fileName, invoiceNumber, reservation };
  }

  async generateInvoicePdfDoc(reservationId: string, photographerId?: string) {
    const { pdfBuffer } = await this.getOrCreateInvoicePdf(
      reservationId,
      photographerId,
    );
    const readable = new Readable();
    readable.push(pdfBuffer);
    readable.push(null);
    return readable;
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
    const { pdfBuffer, invoiceUrl, invoiceNumber, reservation } =
      await this.getOrCreateInvoicePdf(reservationId, photographerId);

    await this.emailService.sendInvoice(
      reservation.customer.email,
      `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      invoiceNumber,
      pdfBuffer,
      invoiceUrl,
    );

    return { message: 'Invoice email resent successfully.' };
  }
}
