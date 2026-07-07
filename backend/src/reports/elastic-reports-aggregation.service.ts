import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { INDEX_NAME } from './analytics-sync.service';
import {
  getDateFilters,
  getTimelineInterval,
} from './elastic/elastic-date.util';
import {
  buildGenerateReportQuery,
  buildLeaderboardQuery,
} from './elastic/elastic-query-builder.util';
import {
  parseReportAggregations,
  parseLeaderboardAggregations,
} from './elastic/elastic-response-parser.util';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class ElasticReportsAggregationService {
  constructor(
    private readonly esService: ElasticsearchService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateReportData(
    photographerId: string | undefined,
    period: 'weekly' | 'monthly' | 'yearly' | 'custom',
    customStartDate?: string,
    customEndDate?: string,
  ) {
    const { startDate, endDate } = getDateFilters(
      period,
      customStartDate,
      customEndDate,
    );
    const { interval, format } = getTimelineInterval(startDate, endDate);

    const filters: any[] = [
      {
        range: {
          date: {
            gte: startDate.toISOString(),
            lte: endDate.toISOString(),
          },
        },
      },
    ];

    if (photographerId) {
      filters.push({ term: { photographerId } });
    }

    const { query, aggregations } = buildGenerateReportQuery(
      filters,
      interval,
      format,
      photographerId,
    );

    const res = await this.esService.search({
      index: INDEX_NAME,
      size: 10000,
      query,
      aggregations: aggregations as any,
    });

    const aggs = res.aggregations as any;
    const hitsTotal: any = res.hits.total;
    const totalBookings =
      typeof hitsTotal === 'number' ? hitsTotal : hitsTotal?.value || 0;

    const parsedData = parseReportAggregations(
      aggs,
      totalBookings,
      photographerId,
    );

    const locationData = res.hits.hits.map((hit: any) => {
      const src = hit._source;
      return {
        id: src.id,
        eventType: src.eventType,
        locationMapLink: src.locationMapLink,
        district: src.district,
        city: src.city,
        location: src.location,
      };
    });

    let systemStats: any = null;
    if (!photographerId) {
      const totalPhotographers = await this.userRepository.count({
        where: { role: UserRole.PHOTOGRAPHER },
      });
      const totalAdmins = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
      const totalSuspended = await this.userRepository.count({
        where: { isActive: false },
      });
      systemStats = {
        totalPhotographers,
        totalAdmins,
        totalSuspended,
      };
    }

    return {
      period,
      startDateStr: startDate.toISOString().split('T')[0],
      endDateStr: endDate.toISOString().split('T')[0],
      ...parsedData,
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
    const { startDate, endDate } = getDateFilters(
      period,
      customStartDate,
      customEndDate,
    );

    const mustFilters: any[] = [
      {
        range: {
          date: {
            gte: startDate.toISOString(),
            lte: endDate.toISOString(),
          },
        },
      },
    ];

    const mustNotFilters: any[] = [
      { term: { status: 'CANCELLED' } },
      { term: { status: 'REJECTED' } },
    ];

    if (search) {
      mustFilters.push({
        multi_match: {
          query: search,
          fields: ['photographerName', 'photographerEmail'],
          fuzziness: 'AUTO',
        },
      });
    }

    const { query, aggregations } = buildLeaderboardQuery(
      mustFilters,
      mustNotFilters,
      page,
      limit,
    );

    const res = await this.esService.search({
      index: INDEX_NAME,
      size: 0,
      query,
      aggregations: aggregations as any,
    });

    const { total, leaderboard } = parseLeaderboardAggregations(
      res.aggregations as any,
    );

    return {
      data: leaderboard,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
