export function initTimelineMap(
  timelineMap: Record<string, { bookings: number; revenueLkr: number }>,
  type: 'daily' | 'monthly' | 'yearly',
  endDate: Date,
  diffDays: number,
) {
  if (type === 'daily') {
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
  } else if (type === 'monthly') {
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
  }
}
