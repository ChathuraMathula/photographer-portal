import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { FieldError } from "@/components/common/FieldError";

type Props = {
  value: string;
  onChange: (val: string) => void;
  today: string;
  error?: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CalendarPicker({ value, onChange, today, error }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [navDate, setNavDate] = useState(() => {
    const initial = value ? new Date(value) : new Date();
    return isNaN(initial.getTime()) ? new Date() : initial;
  });

  const getDateLabel = () => {
    if (!value) return "Select preferred date";
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) return value;
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const buildCalendarGrid = () => {
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

  const handlePrevMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
    setShowCalendar(false);
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const checkDate = new Date(date);
    checkDate.setHours(23, 59, 59, 999);
    const limitDate = new Date(today);
    limitDate.setHours(0, 0, 0, 0);
    return checkDate < limitDate;
  };

  const calendarGrid = buildCalendarGrid();

  return (
    <div className="space-y-2 relative">
      <Button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`w-full h-[50px] justify-start text-left font-normal bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border ${
          error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
        } rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center gap-2.5 shadow-sm`}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 shrink-0" />
        {getDateLabel()}
      </Button>

      {showCalendar && (
        <>
          <div
            className="fixed inset-0 z-30 bg-transparent"
            onClick={() => setShowCalendar(false)}
          />
          <div className="absolute top-[55px] left-0 z-40 w-full sm:w-[320px] rounded-xl border border-zinc-200/60 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                {MONTHS[navDate.getMonth()]} {navDate.getFullYear()}
              </h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-zinc-450 uppercase mb-2">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} />;
                }
                const isDisabled = isDateDisabled(date);
                const isSelected = value === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateSelect(date)}
                    className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold"
                        : isDisabled
                        ? "text-zinc-300 dark:text-zinc-700 pointer-events-none cursor-not-allowed"
                        : "text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      <FieldError msg={error} />
    </div>
  );
}
