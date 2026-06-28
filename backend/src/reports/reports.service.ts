import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import PDFDocument = require('pdfkit');

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async generateReportData(photographerId: string, period: 'weekly' | 'monthly' | 'yearly') {
    const today = new Date();
    let startDate = new Date();

    if (period === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setDate(today.getDate() - 30);
    } else {
      startDate.setDate(today.getDate() - 365);
    }

    // Fetch all reservations for this photographer in the period
    const reservations = await this.reservationRepository.find({
      where: {
        photographerId,
        date: Between(startDate, today),
      },
      relations: {
        customer: true,
      },
      order: {
        date: 'ASC',
      },
    });

    // Fetch all successful payments for this photographer's reservations in the period
    // To do this reliably, we'll fetch payments that belong to this photographer's reservations
    const payments = await this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'reservation')
      .where('reservation.photographerId = :photographerId', { photographerId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.createdAt >= :startDate', { startDate })
      .getMany();

    // Calculations
    const totalBookings = reservations.length;
    
    // Revenue calculations (in cents, then convert to LKR)
    // Potential Revenue: Sum of totalAmountInCents of non-cancelled/non-rejected bookings
    const potentialRevenueCents = reservations
      .filter(res => res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.REJECTED)
      .reduce((sum, res) => sum + (res.totalAmountInCents || 0), 0);
    
    const paidRevenueCents = payments.reduce((sum, pay) => sum + (pay.amountInCents || 0), 0);
    const pendingRevenueCents = Math.max(0, potentialRevenueCents - paidRevenueCents);

    const potentialRevenueLkr = potentialRevenueCents / 100;
    const paidRevenueLkr = paidRevenueCents / 100;
    const pendingRevenueLkr = pendingRevenueCents / 100;

    // Conversion rate: Confirmed or Completed reservations out of total bookings
    const successfulBookings = reservations.filter(
      res => res.status === ReservationStatus.CONFIRMED || res.status === ReservationStatus.COMPLETED
    ).length;
    const conversionRate = totalBookings > 0 ? Math.round((successfulBookings / totalBookings) * 100) : 0;

    // Booking Status Distribution
    const statusCounts = {
      PENDING: 0,
      PROPOSED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      REJECTED: 0,
    };
    reservations.forEach(res => {
      if (statusCounts[res.status] !== undefined) {
        statusCounts[res.status]++;
      }
    });

    // Event Types breakdown
    const eventTypeCounts: Record<string, number> = {};
    reservations.forEach(res => {
      const type = res.eventType || 'Other';
      eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
    });
    const eventTypes = Object.entries(eventTypeCounts).map(([name, count]) => ({ name, count }));

    // Package Performance breakdown
    const packageCounts: Record<string, { count: number; revenueCents: number }> = {};
    reservations
      .filter(res => res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.REJECTED)
      .forEach(res => {
        let pkgName = 'Custom/Quotation';
        if (res.selectedPackages && Array.isArray(res.selectedPackages) && res.selectedPackages.length > 0) {
          pkgName = res.selectedPackages[0].name || pkgName;
        }
        
        if (!packageCounts[pkgName]) {
          packageCounts[pkgName] = { count: 0, revenueCents: 0 };
        }
        packageCounts[pkgName].count++;
        packageCounts[pkgName].revenueCents += res.totalAmountInCents || 0;
      });

    const packages = Object.entries(packageCounts).map(([name, data]) => ({
      name,
      count: data.count,
      revenueLkr: data.revenueCents / 100,
    })).sort((a, b) => b.revenueLkr - a.revenueLkr);

    // Timeline Coordinates
    const timelineMap: Record<string, { bookings: number; revenueLkr: number }> = {};

    if (period === 'weekly') {
      // 7 Days timeline
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        timelineMap[label] = { bookings: 0, revenueLkr: 0 };
      }
      
      reservations.forEach(res => {
        const label = new Date(res.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (timelineMap[label]) {
          timelineMap[label].bookings++;
        }
      });
      payments.forEach(pay => {
        const label = new Date(pay.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (timelineMap[label]) {
          timelineMap[label].revenueLkr += pay.amountInCents / 100;
        }
      });
    } else if (period === 'monthly') {
      // 30 Days timeline aggregated weekly or in 5-day buckets
      for (let i = 25; i >= 0; i -= 5) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timelineMap[label] = { bookings: 0, revenueLkr: 0 };
      }

      const keys = Object.keys(timelineMap);
      
      reservations.forEach(res => {
        const resDate = new Date(res.date);
        // Find closest bucket
        let closest = keys[0];
        let minDiff = Infinity;
        keys.forEach(k => {
          const diff = Math.abs(resDate.getTime() - new Date(k + `, ${today.getFullYear()}`).getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closest = k;
          }
        });
        timelineMap[closest].bookings++;
      });
      
      payments.forEach(pay => {
        const payDate = new Date(pay.createdAt);
        let closest = keys[0];
        let minDiff = Infinity;
        keys.forEach(k => {
          const diff = Math.abs(payDate.getTime() - new Date(k + `, ${today.getFullYear()}`).getTime());
          if (diff < minDiff) {
            minDiff = diff;
            closest = k;
          }
        });
        timelineMap[closest].revenueLkr += pay.amountInCents / 100;
      });
    } else {
      // 12 Months timeline
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        timelineMap[label] = { bookings: 0, revenueLkr: 0 };
      }
      
      reservations.forEach(res => {
        const label = new Date(res.date).toLocaleDateString('en-US', { month: 'short' });
        if (timelineMap[label]) {
          timelineMap[label].bookings++;
        }
      });
      payments.forEach(pay => {
        const label = new Date(pay.createdAt).toLocaleDateString('en-US', { month: 'short' });
        if (timelineMap[label]) {
          timelineMap[label].revenueLkr += pay.amountInCents / 100;
        }
      });
    }

    const timeline = Object.entries(timelineMap).map(([label, data]) => ({
      label,
      bookings: data.bookings,
      revenueLkr: data.revenueLkr,
    }));

    return {
      period,
      summary: {
        totalBookings,
        potentialRevenueLkr,
        paidRevenueLkr,
        pendingRevenueLkr,
        conversionRate,
      },
      statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      eventTypes,
      packages,
      timeline,
      rawBookings: reservations.map(res => ({
        id: res.id,
        clientName: res.customer ? `${res.customer.firstName} ${res.customer.lastName}` : 'Manual Client',
        date: res.date,
        eventType: res.eventType,
        totalLkr: (res.totalAmountInCents || 0) / 100,
        status: res.status,
      })),
    };
  }

  async generateReportPdf(photographerId: string, period: 'weekly' | 'monthly' | 'yearly'): Promise<any> {
    const data = await this.generateReportData(photographerId, period);
    
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    // Theme Colors
    const primaryColor = '#18181b'; // zinc-900
    const accentColor = '#2563eb'; // blue-600
    const textColor = '#3f3f46'; // zinc-600
    const lightBg = '#f4f4f5'; // zinc-100
    const borderColor = '#e4e4e7'; // zinc-200

    // Title & Header
    doc.fillColor(primaryColor)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Photographer Portal - Analytics Report', 50, 50);

    doc.fillColor(textColor)
      .fontSize(10)
      .font('Helvetica')
      .text(`Period: ${period.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, 50, 78);

    doc.moveTo(50, 95)
      .lineTo(545, 95)
      .strokeColor(borderColor)
      .lineWidth(1)
      .stroke();

    // Summary Cards (Grid)
    doc.fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Key Performance Indicators', 50, 115);

    // Card 1: Revenue
    doc.rect(50, 135, 150, 80)
      .fillAndStroke(lightBg, borderColor);
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTAL REVENUE (LKR)', 60, 148);
    doc.fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`${data.summary.potentialRevenueLkr.toLocaleString()}`, 60, 168);
    doc.fillColor(textColor)
      .fontSize(8)
      .font('Helvetica')
      .text(`Paid LKR ${data.summary.paidRevenueLkr.toLocaleString()}`, 60, 192);

    // Card 2: Bookings
    doc.rect(215, 135, 150, 80)
      .fillAndStroke(lightBg, borderColor);
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTAL BOOKINGS', 225, 148);
    doc.fillColor(primaryColor)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`${data.summary.totalBookings}`, 225, 168);
    doc.fillColor(textColor)
      .fontSize(8)
      .font('Helvetica')
      .text('Reservations in range', 225, 192);

    // Card 3: Conversion Rate
    doc.rect(380, 135, 165, 80)
      .fillAndStroke(lightBg, borderColor);
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('CONVERSION RATE', 390, 148);
    doc.fillColor(accentColor)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`${data.summary.conversionRate}%`, 390, 168);
    doc.fillColor(textColor)
      .fontSize(8)
      .font('Helvetica')
      .text('Confirmed & Completed ratio', 390, 192);

    // Section: Package Performance
    doc.fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Package Performance', 50, 245);

    // Package Table Header
    let y = 270;
    doc.rect(50, y, 495, 20).fill(primaryColor);
    doc.fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Package Name', 60, y + 6)
      .text('Bookings Count', 320, y + 6)
      .text('Total Revenue (LKR)', 430, y + 6);

    y += 20;
    data.packages.forEach((pkg, index) => {
      const bg = index % 2 === 0 ? '#ffffff' : lightBg;
      doc.rect(50, y, 495, 22).fillAndStroke(bg, borderColor);
      doc.fillColor(primaryColor)
        .fontSize(9)
        .font('Helvetica')
        .text(pkg.name, 60, y + 7)
        .text(`${pkg.count}`, 320, y + 7)
        .text(`${pkg.revenueLkr.toLocaleString()}`, 430, y + 7);
      y += 22;
    });

    if (data.packages.length === 0) {
      doc.rect(50, y, 495, 22).fillAndStroke('#ffffff', borderColor);
      doc.fillColor(textColor)
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text('No package booking stats in this period.', 60, y + 7);
      y += 22;
    }

    // Event Types distribution
    y += 30;
    doc.fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Event Type Preferences', 50, y);

    y += 25;
    doc.rect(50, y, 495, 20).fill(primaryColor);
    doc.fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Event Category', 60, y + 6)
      .text('Bookings Count', 320, y + 6);

    y += 20;
    data.eventTypes.forEach((evt, index) => {
      const bg = index % 2 === 0 ? '#ffffff' : lightBg;
      doc.rect(50, y, 495, 22).fillAndStroke(bg, borderColor);
      doc.fillColor(primaryColor)
        .fontSize(9)
        .font('Helvetica')
        .text(evt.name, 60, y + 7)
        .text(`${evt.count}`, 320, y + 7);
      y += 22;
    });

    if (data.eventTypes.length === 0) {
      doc.rect(50, y, 495, 22).fillAndStroke('#ffffff', borderColor);
      doc.fillColor(textColor)
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text('No event preference stats in this period.', 60, y + 7);
      y += 22;
    }

    // Footnotes / Business recommendation
    y += 30;
    doc.rect(50, y, 495, 60).fillAndStroke(lightBg, borderColor);
    doc.fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Business Advisory Notes:', 60, y + 10);
    
    let recommendation = 'Your package metrics show steady demand. Promote high-performing packages with bundle discounts.';
    if (data.summary.conversionRate < 50) {
      recommendation = 'Your booking conversion rate is below 50%. Consider following up faster on proposed quotations or adjusting deposit requirements.';
    } else if (data.summary.totalBookings > 10) {
      recommendation = 'Excellent booking traction! You might want to introduce premium package tiers or adjust pricing up for your most popular event types.';
    }
    
    doc.fillColor(textColor)
      .fontSize(9)
      .font('Helvetica')
      .text(recommendation, 60, y + 25, { width: 475 });

    return doc;
  }
}
