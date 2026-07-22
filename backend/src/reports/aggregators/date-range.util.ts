export function getDateRange(
  period: 'weekly' | 'monthly' | 'yearly' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
): { startDate: Date; endDate: Date } {
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    endDate = new Date(customEndDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Standardize end date to end of today
    endDate.setHours(23, 59, 59, 999);
    if (period === 'weekly') {
      startDate.setDate(today.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate.setDate(today.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'yearly') {
      startDate.setDate(today.getDate() - 365);
      startDate.setHours(0, 0, 0, 0);
    }
  }

  return { startDate, endDate };
}
