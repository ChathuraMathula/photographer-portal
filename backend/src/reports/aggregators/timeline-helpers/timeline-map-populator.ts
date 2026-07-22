export function populateTimelineMap(
  timelineMap: Record<string, { bookings: number; revenueLkr: number }>,
  type: 'daily' | 'monthly' | 'yearly',
  rawBookings: any[],
  rawPayments: any[],
) {
  const keys = Object.keys(timelineMap);
  const currentYear = new Date().getFullYear();

  const getLabel = (dateStr: string, t: 'daily' | 'yearly') => {
    const d = new Date(dateStr);
    return t === 'daily'
      ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const findClosestMonthlyLabel = (dateStr: string) => {
    const targetTime = new Date(dateStr).getTime();
    let closest = keys[0];
    let minDiff = Infinity;
    keys.forEach((k) => {
      const diff = Math.abs(targetTime - new Date(`${k}, ${currentYear}`).getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = k;
      }
    });
    return closest;
  };

  rawBookings.forEach((rb) => {
    const label = type === 'monthly' ? findClosestMonthlyLabel(rb.date) : getLabel(rb.date, type);
    if (timelineMap[label]) {
      timelineMap[label].bookings += parseInt(rb.count, 10) || 0;
    }
  });

  rawPayments.forEach((rp) => {
    const label = type === 'monthly' ? findClosestMonthlyLabel(rp.date) : getLabel(rp.date, type);
    if (timelineMap[label]) {
      timelineMap[label].revenueLkr += (parseInt(rp.amountInCents, 10) || 0) / 100;
    }
  });
}
