import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { buildFinancialReportPdf, buildBookingsReportPdf } from './reports-pdf-builder';

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

  async generateFinancialReportPdf(photographerId: string, period: 'weekly' | 'monthly' | 'yearly'): Promise<any> {
    const data = await this.generateReportData(photographerId, period);
    return buildFinancialReportPdf(data, period);
  }

  async generateBookingsReportPdf(photographerId: string, period: 'weekly' | 'monthly' | 'yearly'): Promise<any> {
    const data = await this.generateReportData(photographerId, period);
    return buildBookingsReportPdf(data, period);
  }
}
