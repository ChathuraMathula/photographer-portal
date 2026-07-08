import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { getDateRange } from './database/date-range.util';
import { aggregateSummary } from './database/summary.aggregator';
import { aggregateStatusDistribution } from './database/status.aggregator';
import { aggregateEventTypes } from './database/event-type.aggregator';
import { aggregatePackages } from './database/package.aggregator';
import { aggregateTimeline } from './database/timeline.aggregator';
import { aggregateSystemStats } from './database/system-stats.aggregator';
import { aggregateLeaderboard } from './database/leaderboard.aggregator';
import { aggregateRawBookings } from './database/bookings-raw.aggregator';

@Injectable()
export class ReportsAggregationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateReportData(
    photoId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    startStr?: string,
    endStr?: string,
  ) {
    const { startDate, endDate } = getDateRange(period, startStr, endStr);
    const [sum, statusDist, eventTypes, pkgs, timeline, raw] = await Promise.all([
      aggregateSummary(this.reservationRepository, this.paymentRepository, startDate, endDate, photoId),
      aggregateStatusDistribution(this.reservationRepository, startDate, endDate, photoId),
      aggregateEventTypes(this.reservationRepository, startDate, endDate, photoId),
      aggregatePackages(this.reservationRepository, startDate, endDate, photoId),
      aggregateTimeline(this.reservationRepository, this.paymentRepository, startDate, endDate, photoId),
      aggregateRawBookings(this.reservationRepository, startDate, endDate, photoId),
    ]);

    let systemStats: any = null;
    let leaderboard: any[] = [];
    if (!photoId) {
      systemStats = await aggregateSystemStats(this.userRepository);
      leaderboard = (await aggregateLeaderboard(this.reservationRepository, startDate, endDate, 1, 50)).data;
    }

    return {
      period,
      startDateStr: startDate.toISOString().split('T')[0],
      endDateStr: endDate.toISOString().split('T')[0],
      summary: sum,
      statusDistribution: statusDist,
      eventTypes,
      packages: pkgs,
      timeline,
      photographerLeaderboard: leaderboard,
      systemStats,
      locationData: raw,
      rawBookings: raw,
    };
  }

  async getPhotographerLeaderboard(
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    search?: string,
    startStr?: string,
    endStr?: string,
  ) {
    const { startDate, endDate } = getDateRange(period, startStr, endStr);
    return aggregateLeaderboard(this.reservationRepository, startDate, endDate, page, limit, search);
  }
}
