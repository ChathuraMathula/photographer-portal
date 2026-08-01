"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LockedDate } from "@/types";

export type DateRange = {
  from?: Date;
  to?: Date;
};

export type CalendarProps = {
  mode?: "single" | "range";
  selected?: Date | DateRange | null;
  onSelect?: (val: any) => void;
  lockedDates?: LockedDate[];
  className?: string;
  onDayClick?: (day: Date, lockedSlots: LockedDate[]) => void;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  lockedDates = [],
  className,
  onDayClick,
}: CalendarProps) {
  const initialDate =
    mode === "single" && selected instanceof Date
      ? selected
      : (selected as DateRange)?.from || new Date();

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (mode === "single" && selected instanceof Date) {
      setCurrentYear(selected.getFullYear());
      setCurrentMonth(selected.getMonth());
    } else if (mode === "range" && (selected as DateRange)?.from) {
      const fromDate = (selected as DateRange).from!;
      setCurrentYear(fromDate.getFullYear());
      setCurrentMonth(fromDate.getMonth());
    }
  }, [selected, mode]);

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(parseInt(e.target.value, 10));
  };

  const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(e.target.value, 10));
  };

  const isSameDay = (d1?: Date, d2?: Date) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateInRange = (date: Date, range?: DateRange) => {
    if (!range || !range.from || !range.to) return false;
    const t = date.getTime();
    const start = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime();
    const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate()).getTime();
    return t > start && t < end;
  };

  const handleDateClick = (dayDate: Date, dayLocks: LockedDate[]) => {
    if (onDayClick) {
      onDayClick(dayDate, dayLocks);
    }

    if (!onSelect) return;

    if (mode === "single") {
      onSelect(dayDate);
    } else if (mode === "range") {
      const range = (selected as DateRange) || {};
      if (!range.from || (range.from && range.to)) {
        onSelect({ from: dayDate, to: undefined });
      } else if (range.from && !range.to) {
        if (dayDate.getTime() < range.from.getTime()) {
          onSelect({ from: dayDate, to: range.from });
        } else {
          onSelect({ from: range.from, to: dayDate });
        }
      }
    }
  };

  // Build grid days including padding from previous month
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1,
  );

  const gridCells: { date: Date; isOutside: boolean }[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1,
      prevMonthDays - i,
    );
    gridCells.push({ date: prevDate, isOutside: true });
  }

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    gridCells.push({
      date: new Date(currentYear, currentMonth, d),
      isOutside: false,
    });
  }

  const remainingCells = 42 - gridCells.length; // 6 rows x 7 days
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(
      currentMonth === 11 ? currentYear + 1 : currentYear,
      currentMonth === 11 ? 0 : currentMonth + 1,
      i,
    );
    gridCells.push({ date: nextDate, isOutside: true });
  }

  // Generate Year options (1926 to 2035)
  const yearOptions: number[] = [];
  for (let y = 1926; y <= 2035; y++) {
    yearOptions.push(y);
  }

  return (
    <div
      data-slot="calendar"
      className={cn(
        "w-fit rdp-root bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent rtl:**:[.rdp-button_next>svg]:rotate-180 rtl:**:[.rdp-button_previous>svg]:rotate-180 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm",
        className,
      )}
      lang="en-US"
      data-mode={mode}
    >
      <div className="flex gap-4 flex-col md:flex-row relative rdp-months">
        {/* Navigation Bar */}
        <nav
          className="flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between rdp-nav z-10 pointer-events-none"
          aria-label="Navigation bar"
        >
          <button
            type="button"
            onClick={prevMonth}
            className="pointer-events-auto group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer h-8 w-8 p-0 select-none rdp-button_previous"
            aria-label="Go to the Previous Month"
          >
            <ChevronLeft className="size-4 rdp-chevron text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="pointer-events-auto group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer h-8 w-8 p-0 select-none rdp-button_next"
            aria-label="Go to the Next Month"
          >
            <ChevronRight className="size-4 rdp-chevron text-zinc-600 dark:text-zinc-400" />
          </button>
        </nav>

        <div className="flex flex-col w-full gap-4 rdp-month">
          {/* Header Month/Year Dropdowns */}
          <div className="flex items-center justify-center h-8 w-full px-8 rdp-month_caption">
            <div className="w-full flex items-center text-sm font-medium justify-center h-8 gap-1.5 rdp-dropdowns">
              {/* Month Dropdown */}
              <span className="relative has-focus:border-ring border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-md rdp-dropdown_root bg-white dark:bg-zinc-900">
                <select
                  value={currentMonth}
                  onChange={handleMonthSelect}
                  className="absolute bg-popover inset-0 opacity-0 rdp-dropdown rdp-months_dropdown cursor-pointer w-full h-full"
                  aria-label="Choose the Month"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="select-none font-medium rounded-md pl-2.5 pr-1.5 flex items-center gap-1 text-xs h-7 text-zinc-800 dark:text-zinc-200 rdp-caption_label">
                  {MONTHS[currentMonth]}
                  <ChevronDown className="size-3.5 text-zinc-400" />
                </span>
              </span>

              {/* Year Dropdown */}
              <span className="relative has-focus:border-ring border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-md rdp-dropdown_root bg-white dark:bg-zinc-900">
                <select
                  value={currentYear}
                  onChange={handleYearSelect}
                  className="absolute bg-popover inset-0 opacity-0 rdp-dropdown rdp-years_dropdown cursor-pointer w-full h-full"
                  aria-label="Choose the Year"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="select-none font-medium rounded-md pl-2.5 pr-1.5 flex items-center gap-1 text-xs h-7 text-zinc-800 dark:text-zinc-200 rdp-caption_label">
                  {currentYear}
                  <ChevronDown className="size-3.5 text-zinc-400" />
                </span>
              </span>
            </div>
          </div>

          {/* Grid Table */}
          <table role="grid" className="rdp-month_grid w-full border-collapse">
            <thead>
              <tr className="flex rdp-weekdays mb-1">
                {WEEKDAYS.map((w) => (
                  <th
                    key={w}
                    className="text-zinc-400 dark:text-zinc-500 rounded-md flex-1 font-semibold text-[0.75rem] select-none text-center py-1 rdp-weekday"
                    scope="col"
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="rdp-weeks space-y-1">
              {Array.from({ length: 6 }).map((_, rowIndex) => {
                const rowCells = gridCells.slice(rowIndex * 7, (rowIndex + 1) * 7);
                return (
                  <tr key={rowIndex} className="flex w-full rdp-week gap-0.5">
                    {rowCells.map(({ date, isOutside }, colIndex) => {
                      const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                      const dayLocks = lockedDates.filter((ld) => ld.date === isoDate);
                      const isLocked = dayLocks.length > 0;
                      const isToday = isSameDay(date, new Date());

                      const singleSelected =
                        mode === "single" && selected instanceof Date && isSameDay(date, selected);

                      const range = mode === "range" ? (selected as DateRange) : undefined;
                      const isRangeStart = isSameDay(date, range?.from);
                      const isRangeEnd = isSameDay(date, range?.to);
                      const isRangeMiddle = isDateInRange(date, range);

                      return (
                        <td
                          key={colIndex}
                          className={cn(
                            "relative w-full h-full p-0 text-center flex-1 aspect-square select-none rdp-day",
                            isOutside && "text-zinc-300 dark:text-zinc-700 opacity-40",
                          )}
                          role="gridcell"
                        >
                          <button
                            type="button"
                            onClick={() => handleDateClick(date, dayLocks)}
                            className={cn(
                              "relative group/button shrink-0 flex flex-col items-center justify-center rounded-lg border border-transparent text-xs whitespace-nowrap transition-all outline-none select-none h-8 w-full font-medium cursor-pointer",
                              isToday && "font-bold text-[#0e2d5c] dark:text-blue-400 border-[#0e2d5c]/30",
                              singleSelected &&
                                "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900 font-bold shadow-sm",
                              isRangeStart &&
                                "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900 font-bold rounded-r-none shadow-sm",
                              isRangeEnd &&
                                "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900 font-bold rounded-l-none shadow-sm",
                              isRangeMiddle &&
                                "bg-[#0e2d5c]/15 dark:bg-white/15 text-[#0e2d5c] dark:text-white rounded-none",
                              isLocked &&
                                !singleSelected &&
                                !isRangeStart &&
                                !isRangeEnd &&
                                "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 font-bold",
                              !singleSelected &&
                                !isRangeStart &&
                                !isRangeEnd &&
                                !isRangeMiddle &&
                                !isOutside &&
                                "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
                            )}
                          >
                            <span>{date.getDate()}</span>
                            {isLocked && (
                              <Lock className="absolute top-0.5 right-0.5 h-2 w-2 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
