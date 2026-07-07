export function parseReportAggregations(
  aggs: any,
  totalBookings: number,
  photographerId: string | undefined,
) {
  const potentialRevenueCents =
    aggs.total_potential_revenue.sum_revenue.value || 0;
  const paidRevenueCents = aggs.total_paid_revenue.value || 0;
  const pendingRevenueCents = Math.max(
    0,
    potentialRevenueCents - paidRevenueCents,
  );

  const successfulBookings = aggs.successful_bookings.doc_count;
  const conversionRate =
    totalBookings > 0
      ? Math.round((successfulBookings / totalBookings) * 100)
      : 0;

  const statusDistribution = aggs.status_distribution.buckets.map((b: any) => ({
    name: b.key,
    value: b.doc_count,
  }));

  const eventTypes = aggs.event_types.buckets.map((b: any) => ({
    name: b.key,
    count: b.doc_count,
  }));

  const packages = aggs.packages.by_package.buckets
    .map((b: any) => ({
      name: b.key,
      count: b.doc_count,
      revenueLkr: (b.revenue.value || 0) / 100,
    }))
    .sort((a: any, b: any) => b.revenueLkr - a.revenueLkr);

  const timeline = aggs.timeline.buckets.map((b: any) => ({
    label: b.key_as_string,
    bookings: b.doc_count,
    revenueLkr: (b.revenue.value || 0) / 100,
  }));

  let photographerLeaderboard: any[] = [];
  if (!photographerId && aggs.photographers) {
    photographerLeaderboard = aggs.photographers.buckets
      .map((b: any) => ({
        id: b.key,
        name: b.name.buckets[0]?.key || 'Unknown',
        email: b.email.buckets[0]?.key || '',
        bookingsCount: b.doc_count,
        revenueLkr: (b.revenue.value || 0) / 100,
      }))
      .sort((a: any, b: any) => b.revenueLkr - a.revenueLkr);
  }

  return {
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
  };
}

export function parseLeaderboardAggregations(aggs: any) {
  const total = aggs.total_unique.value || 0;

  const leaderboard = aggs.photographers.buckets.map((b: any) => ({
    id: b.key,
    name: b.name.buckets[0]?.key || 'Unknown',
    email: b.email.buckets[0]?.key || '',
    bookingsCount: b.doc_count,
    revenueLkr: (b.revenue.value || 0) / 100,
  }));

  return { total, leaderboard };
}
