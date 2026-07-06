export function buildGenerateReportQuery(
  filters: any[],
  interval: string,
  format: string,
  photographerId?: string,
) {
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

  return { query, aggregations };
}

export function buildLeaderboardQuery(
  mustFilters: any[],
  mustNotFilters: any[],
  page: number,
  limit: number,
) {
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
            sort: [{ revenue: { order: 'desc' } }],
            from: (page - 1) * limit,
            size: limit,
          },
        },
      },
    },
    total_unique: {
      cardinality: { field: 'photographerId' },
    },
  };

  return { query, aggregations };
}
