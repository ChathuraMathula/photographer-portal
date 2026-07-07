export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const buildCalendarGrid = (navDate: Date) => {
  const year = navDate.getFullYear();
  const month = navDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
};

export const isDateDisabled = (date: Date | null, limitDateStr: string) => {
  if (!date) return true;
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const limitDate = new Date(limitDateStr);
  limitDate.setHours(0, 0, 0, 0);
  return checkDate <= limitDate;
};
