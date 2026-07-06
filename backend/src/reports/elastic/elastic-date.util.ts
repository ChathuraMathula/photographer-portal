export function getDateFilters(
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

  return { startDate, endDate };
}

export function getTimelineInterval(startDate: Date, endDate: Date) {
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

  return { interval, format };
}
