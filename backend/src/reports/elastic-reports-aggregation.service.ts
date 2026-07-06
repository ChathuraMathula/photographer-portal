import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { INDEX_NAME } from './analytics-sync.service';

@Injectable()
export class ElasticReportsAggregationService {
  constructor(private readonly esService: ElasticsearchService) {}

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

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    let interval = 'month';
    let format = 'MMM yyyy';
    if (diffDays <= 8) {
      interval = 'day';
      format = 'EEE, MMM d';
    } else if (diffDays <= 45) {
      interval = 'week';
      format = 'MMM d';
    }

    const query = { bool: { filter: filters } };
    const aggregations = {
      total_potential_revenue: {
        filter: {
          bool: {
            must_not: [
              { term: { status: 'CANCELLED' } },
              { term: { status: 'REJECTED' } },
            ],
          },
        },
        aggs: { sum_revenue: { sum: { field: 'totalAmountInCents' } } },
      },
      total_paid_revenue: { sum: { field: 'paidAmountInCents' } },
      successful_bookings: {
        filter: {
          terms: { status: ['CONFIRMED', 'COMPLETED'] },
        },
      },
      status_distribution: { terms: { field: 'status' } },
      event_types: { terms: { field: 'eventType' } },
      packages: {
        filter: {
          bool: {
            must_not: [
              { term: { status: 'CANCELLED' } },
              { term: { status: 'REJECTED' } },
            ],
          },
        },
        aggs: {
          by_package: {
            terms: { field: 'packageName' },
            aggs: { revenue: { sum: { field: 'totalAmountInCents' } } },
          },
        },
      },
      timeline: {
        date_histogram: {
          field: 'date',
          calendar_interval: interval,
          format: format,
        },
        aggs: { revenue: { sum: { field: 'paidAmountInCents' } } },
      },
      photographers: {
        terms: { field: 'photographerId', size: 100 },
        aggs: {
          name: { terms: { field: 'photographerName' } },
          email: { terms: { field: 'photographerEmail' } },
          revenue: { sum: { field: 'totalAmountInCents' } },
        },
      },
    };

    const res = await this.esService.search({
      index: INDEX_NAME,
      size: 10000,
      query,
      aggregations: aggregations as any,
    });

    const aggs = res.aggregations as any;
    const hitsTotal: any = res.hits.total;
    const totalBookings = typeof hitsTotal === 'number' ? hitsTotal : (hitsTotal?.value || 0);

    const potentialRevenueCents = aggs.total_potential_revenue.sum_revenue.value || 0;
    const paidRevenueCents = aggs.total_paid_revenue.value || 0;
    const pendingRevenueCents = Math.max(0, potentialRevenueCents - paidRevenueCents);

    const successfulBookings = aggs.successful_bookings.doc_count;
    const conversionRate = totalBookings > 0 ? Math.round((successfulBookings / totalBookings) * 100) : 0;

    const statusDistribution = aggs.status_distribution.buckets.map((b: any) => ({
      name: b.key,
      value: b.doc_count,
    }));

    const eventTypes = aggs.event_types.buckets.map((b: any) => ({
      name: b.key,
      count: b.doc_count,
    }));

    const packages = aggs.packages.by_package.buckets.map((b: any) => ({
      name: b.key,
      count: b.doc_count,
      revenueLkr: (b.revenue.value || 0) / 100,
    })).sort((a: any, b: any) => b.revenueLkr - a.revenueLkr);

    const timeline = aggs.timeline.buckets.map((b: any) => ({
      label: b.key_as_string,
      bookings: b.doc_count,
      revenueLkr: (b.revenue.value || 0) / 100,
    }));

    let photographerLeaderboard: any[] = [];
    if (!photographerId && aggs.photographers) {
      photographerLeaderboard = aggs.photographers.buckets.map((b: any) => ({
        id: b.key,
        name: b.name.buckets[0]?.key || 'Unknown',
        email: b.email.buckets[0]?.key || '',
        bookingsCount: b.doc_count,
        revenueLkr: (b.revenue.value || 0) / 100,
      })).sort((a: any, b: any) => b.revenueLkr - a.revenueLkr);
    }

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

    return {
      period,
      startDateStr: startDate.toISOString().split('T')[0],
      endDateStr: endDate.toISOString().split('T')[0],
      summary: {
        totalBookings,
        potentialRevenueLkr: potentialRevenueCents / 100,
        paidRevenueLkr: paidRevenueCents / 100,
        pendingRevenueLkr: pendingRevenueCents / 100,
        conversionRate,
      },
      statusDistribution,
      eventTypes,
      packages,
      timeline,
      photographerLeaderboard,
      systemStats: null, 
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

    const query = {
      bool: {
        must: mustFilters,
        must_not: mustNotFilters,
      },
    };
    
    const aggregations = {
      photographers: {
        terms: { field: 'photographerId', size: 1000 },
        aggs: {
          name: { terms: { field: 'photographerName' } },
          email: { terms: { field: 'photographerEmail' } },
          revenue: { sum: { field: 'totalAmountInCents' } },
          bucket_sort: {
            bucket_sort: {
              sort: [{ 'revenue': { order: 'desc' } }],
              from: (page - 1) * limit,
              size: limit,
            },
          },
        },
      },
      total_unique: {
        cardinality: { field: 'photographerId' }
      }
    };

    const res = await this.esService.search({
      index: INDEX_NAME,
      size: 0,
      query,
      aggregations: aggregations as any,
    });

    const aggs = res.aggregations as any;
    const total = aggs.total_unique.value || 0;

    const leaderboard = aggs.photographers.buckets.map((b: any) => ({
      id: b.key,
      name: b.name.buckets[0]?.key || 'Unknown',
      email: b.email.buckets[0]?.key || '',
      bookingsCount: b.doc_count,
      revenueLkr: (b.revenue.value || 0) / 100,
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
