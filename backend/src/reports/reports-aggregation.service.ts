import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class ReportsAggregationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async generateReportData(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ) {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === 'weekly') {
        startDate.setDate(today.getDate() - 7);
      } else if (period === 'monthly') {
        startDate.setDate(today.getDate() - 30);
      } else if (period === 'yearly') {
        startDate.setDate(today.getDate() - 365);
      }
    }

    const whereClause: any = {
      date: Between(startDate, endDate),
    };
    if (photographerId) {
      whereClause.photographerId = photographerId;
    }

    const reservations = await this.reservationRepository.find({
      where: whereClause,
      relations: {
        customer: true,
        photographer: true,
      },
      order: {
        date: 'ASC',
      },
    });

    const paymentsQuery = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.reservation', 'reservation')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.createdAt >= :startDate', { startDate })
      .andWhere('payment.createdAt <= :endDate', { endDate });

    if (photographerId) {
      paymentsQuery.andWhere('reservation.photographerId = :photographerId', {
        photographerId,
      });
    }
    const payments = await paymentsQuery.getMany();

    const totalBookings = reservations.length;

    const potentialRevenueCents = reservations
      .filter(
        (res) =>
          res.status !== ReservationStatus.CANCELLED &&
          res.status !== ReservationStatus.REJECTED,
      )
      .reduce((sum, res) => sum + (res.totalAmountInCents || 0), 0);

    const paidRevenueCents = payments.reduce(
      (sum, pay) => sum + (pay.amountInCents || 0),
      0,
    );
    const pendingRevenueCents = Math.max(
      0,
      potentialRevenueCents - paidRevenueCents,
    );

    const potentialRevenueLkr = potentialRevenueCents / 100;
    const paidRevenueLkr = paidRevenueCents / 100;
    const pendingRevenueLkr = pendingRevenueCents / 100;

    const successfulBookings = reservations.filter(
      (res) =>
        res.status === ReservationStatus.CONFIRMED ||
        res.status === ReservationStatus.COMPLETED,
    ).length;
    const conversionRate =
      totalBookings > 0
        ? Math.round((successfulBookings / totalBookings) * 100)
        : 0;

    const statusCounts = {
      PENDING: 0,
      PROPOSED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      REJECTED: 0,
    };
    reservations.forEach((res) => {
      if (statusCounts[res.status] !== undefined) {
        statusCounts[res.status]++;
      }
    });

    const eventTypeCounts: Record<string, number> = {};
    reservations.forEach((res) => {
      const type = res.eventType || 'Other';
      eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
    });
    const eventTypes = Object.entries(eventTypeCounts).map(([name, count]) => ({
      name,
      count,
    }));

    const packageCounts: Record<string, { count: number; revenueCents: number }> = {};
    reservations
      .filter(
        (res) =>
          res.status !== ReservationStatus.CANCELLED &&
          res.status !== ReservationStatus.REJECTED,
      )
      .forEach((res) => {
        let pkgName = 'Custom/Quotation';
        if (
          res.selectedPackages &&
          Array.isArray(res.selectedPackages) &&
          res.selectedPackages.length > 0
        ) {
          pkgName = res.selectedPackages[0].name || pkgName;
        }

        if (!packageCounts[pkgName]) {
          packageCounts[pkgName] = { count: 0, revenueCents: 0 };
        }
        packageCounts[pkgName].count++;
        packageCounts[pkgName].revenueCents += res.totalAmountInCents || 0;
      });

    const packages = Object.entries(packageCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenueLkr: data.revenueCents / 100,
      }))
      .sort((a, b) => b.revenueLkr - a.revenueLkr);

    const timelineMap: Record<string, { bookings: number; revenueLkr: number }> = {};
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let timelineType: 'daily' | 'monthly' | 'yearly' = 'monthly';
    if (diffDays <= 8) {
      timelineType = 'daily';
    } else if (diffDays <= 45) {
      timelineType = 'monthly';
    } else {
      timelineType = 'yearly';
    }

    if (timelineType === 'daily') {
      for (let i = diffDays - 1; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - i);
        const label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        timelineMap[label] = { bookings: 0, revenueLkr: 0 };
      }

      reservations.forEach((res) => {
        const label = new Date(res.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        if (timelineMap[label]) {
          timelineMap[label].bookings++;
        }
      });
      payments.forEach((pay) => {
        const label = new Date(pay.createdAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        if (timelineMap[label]) {
          timelineMap[label].revenueLkr += pay.amountInCents / 100;
        }
      });
    } else if (timelineType === 'monthly') {
      const steps = Math.min(6, Math.max(4, Math.ceil(diffDays / 6)));
      for (let i = diffDays - 5; i >= 0; i -= steps) {
        const d = new Date(endDate);
        d.setDate(endDate.getDate() - i);
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        timelineMap[label] = { bookings: 0, revenueLkr: 0 };
      }

      const keys = Object.keys(timelineMap);

      reservations.forEach((res) => {
        const resDate = new Date(res.date);
        let closest = keys[0];
        let minDiff = Infinity;
        keys.forEach((k) => {
          const diff = Math.abs(
            resDate.getTime() -
              new Date(k + `, ${today.getFullYear()}`).getTime(),
          );
          if (diff < minDiff) {
            minDiff = diff;
            closest = k;
          }
        });
        timelineMap[closest].bookings++;
      });

      payments.forEach((pay) => {
        const payDate = new Date(pay.createdAt);
        let closest = keys[0];
        let minDiff = Infinity;
        keys.forEach((k) => {
          const diff = Math.abs(
            payDate.getTime() -
              new Date(k + `, ${today.getFullYear()}`).getTime(),
          );
          if (diff < minDiff) {
            minDiff = diff;
            closest = k;
          }
        });
        timelineMap[closest].revenueLkr += pay.amountInCents / 100;
      });
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(1);
        d.setMonth(endDate.getMonth() - i);
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        timelineMap[label] = { bookings: 0, revenueLkr: 0 };
      }

      reservations.forEach((res) => {
        const label = new Date(res.date).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        if (timelineMap[label]) {
          timelineMap[label].bookings++;
        }
      });
      payments.forEach((pay) => {
        const label = new Date(pay.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
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

    let photographerLeaderboard: any[] = [];
    let systemStats: any = null;

    if (!photographerId) {
      const manager = this.reservationRepository.manager;
      const totalPhotographers = await manager.count('User', {
        where: { role: 'PHOTOGRAPHER', isActive: true },
      });
      const totalAdmins = await manager.count('User', {
        where: { role: 'ADMIN', isActive: true },
      });
      const totalSuspended = await manager.count('User', {
        where: { isActive: false },
      });

      systemStats = {
        totalPhotographers,
        totalAdmins,
        totalSuspended,
      };

      const photographerStats: Record<string, { name: string; email: string; bookings: number; revenueCents: number }> = {};

      reservations
        .filter(
          (res) =>
            res.status !== ReservationStatus.CANCELLED &&
            res.status !== ReservationStatus.REJECTED,
        )
        .forEach((res) => {
          const photoId = res.photographerId;
          const photoName = res.photographer
            ? `${res.photographer.firstName} ${res.photographer.lastName}`
            : 'Unknown';
          const photoEmail = res.photographer ? res.photographer.email : '';

          if (!photographerStats[photoId]) {
            photographerStats[photoId] = {
              name: photoName,
              email: photoEmail,
              bookings: 0,
              revenueCents: 0,
            };
          }
          photographerStats[photoId].bookings++;
          photographerStats[photoId].revenueCents +=
            res.totalAmountInCents || 0;
        });

      photographerLeaderboard = Object.entries(photographerStats)
        .map(([id, stats]) => ({
          id,
          name: stats.name,
          email: stats.email,
          bookingsCount: stats.bookings,
          revenueLkr: stats.revenueCents / 100,
        }))
        .sort((a, b) => b.revenueLkr - a.revenueLkr);
    }

    const locationData = reservations.map(res => ({
      id: res.id,
      eventType: res.eventType,
      locationMapLink: res.locationMapLink,
      district: res.district,
      city: res.city,
      location: res.location
    }));

    return {
      period,
      startDateStr: startDate.toISOString().split('T')[0],
      endDateStr: endDate.toISOString().split('T')[0],
      summary: {
        totalBookings,
        potentialRevenueLkr,
        paidRevenueLkr,
        pendingRevenueLkr,
        conversionRate,
      },
      statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      })),
      eventTypes,
      packages,
      timeline,
      photographerLeaderboard,
      systemStats,
      locationData,
      rawBookings: [],
    };
  }

  async getPhotographerLeaderboard(
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    search?: string,
    customStartDate?: string,
    customEndDate?: string,
  ) {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (period === 'weekly') {
        startDate.setDate(today.getDate() - 7);
      } else if (period === 'monthly') {
        startDate.setDate(today.getDate() - 30);
      } else if (period === 'yearly') {
        startDate.setDate(today.getDate() - 365);
      }
    }

    const skip = (page - 1) * limit;

    const qb = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.photographer', 'photographer')
      .select('photographer.id', 'id')
      .addSelect('photographer.firstName', 'firstName')
      .addSelect('photographer.lastName', 'lastName')
      .addSelect('photographer.email', 'email')
      .addSelect('COUNT(reservation.id)', 'bookingsCount')
      .addSelect('SUM(reservation.totalAmountInCents)', 'totalAmountInCents')
      .where('reservation.date >= :startDate', { startDate })
      .andWhere('reservation.date <= :endDate', { endDate })
      .andWhere('reservation.status NOT IN (:...statuses)', { statuses: [ReservationStatus.CANCELLED, ReservationStatus.REJECTED] })
      .andWhere('photographer.id IS NOT NULL');

    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(photographer.firstName) LIKE :search OR LOWER(photographer.lastName) LIKE :search OR LOWER(photographer.email) LIKE :search)',
        { search: searchPattern }
      );
    }

    qb.groupBy('photographer.id')
      .addGroupBy('photographer.firstName')
      .addGroupBy('photographer.lastName')
      .addGroupBy('photographer.email')
      .orderBy('"totalAmountInCents"', 'DESC')
      .offset(skip)
      .limit(limit);

    const rawResults = await qb.getRawMany();

    const countQb = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoin('reservation.photographer', 'photographer')
      .select('COUNT(DISTINCT photographer.id)', 'total')
      .where('reservation.date >= :startDate', { startDate })
      .andWhere('reservation.date <= :endDate', { endDate })
      .andWhere('reservation.status NOT IN (:...statuses)', { statuses: [ReservationStatus.CANCELLED, ReservationStatus.REJECTED] })
      .andWhere('photographer.id IS NOT NULL');
      
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      countQb.andWhere(
        '(LOWER(photographer.firstName) LIKE :search OR LOWER(photographer.lastName) LIKE :search OR LOWER(photographer.email) LIKE :search)',
        { search: searchPattern }
      );
    }

    const countResult = await countQb.getRawOne();
    const total = parseInt(countResult.total, 10) || 0;

    const leaderboard = rawResults.map((row) => ({
      id: row.id,
      name: `${row.firstName} ${row.lastName}`.trim(),
      email: row.email,
      bookingsCount: parseInt(row.bookingsCount, 10) || 0,
      revenueLkr: (parseInt(row.totalAmountInCents, 10) || 0) / 100,
    }));

    return {
      data: leaderboard,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
