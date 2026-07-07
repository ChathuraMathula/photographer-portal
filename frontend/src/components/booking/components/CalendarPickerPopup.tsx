import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTHS,
  DAYS_OF_WEEK,
  buildCalendarGrid,
  isDateDisabled,
} from "../utils/calendarUtils";

type Props = {
  navDate: Date;
  value: string;
  today: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
};

export function CalendarPickerPopup({
  navDate,
  value,
  today,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  onClose,
}: Props) {
  const calendarGrid = buildCalendarGrid(navDate);

  return (
    <>
      <div className="fixed inset-0 z-30 bg-transparent" onClick={onClose} />
      <div className="absolute top-[55px] left-0 z-40 w-full sm:w-[320px] rounded-xl border border-zinc-200/60 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3">
          <h4 className="text-body-small-s font-bold text-zinc-900 dark:text-white">
            {MONTHS[navDate.getMonth()]} {navDate.getFullYear()}
          </h4>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onPrevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-body-caption font-semibold text-zinc-450 uppercase mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            const isDisabled = isDateDisabled(date, today);
            const isSelected =
              value ===
              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => onDateSelect(date)}
                className={`h-8 rounded-lg text-body-caption font-semibold flex items-center justify-center transition-all ${isSelected ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold" : isDisabled ? "text-zinc-300 dark:text-zinc-700 pointer-events-none cursor-not-allowed" : "text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
