"use client";

export function generateCalendarDays(currentDate: Date): (Date | null)[] {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  const offset = new Date(y, m, 1).getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= count; i++) days.push(new Date(y, m, i));
  return days;
}

export const formatDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dateStr = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dateStr}`;
};
