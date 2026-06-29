"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  return grid;
}

type DatePickerInputProps = {
  label: string;
  value: string;       // "YYYY-MM-DD"
  onChange: (val: string) => void;
  minDate?: string;
  maxDate?: string;
  buttonClassName?: string;
};

export function DatePickerInput({ label, value, onChange, minDate, maxDate, buttonClassName }: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const grid = buildCalendarGrid(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const isDisabled = (d: Date) => {
    if (minDate && toIso(d) < minDate) return true;
    if (maxDate && toIso(d) > maxDate) return true;
    return false;
  };

  const isSelected = (d: Date) => value === toIso(d);

  const displayValue = parsed
    ? parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Pick a date";

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center gap-1.5 w-full">
        <span className="text-[9px] uppercase font-bold text-zinc-400 whitespace-nowrap">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={cn(
            "h-8 px-3 flex items-center gap-2 text-body-caption border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none transition-colors shadow-sm cursor-pointer whitespace-nowrap",
            buttonClassName
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span>{displayValue}</span>
        </button>
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 w-64 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Month/Year nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <ChevronLeft className="h-4 w-4 text-zinc-500" />
            </button>
            <span className="text-body-small-s font-bold text-zinc-900 dark:text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_HEADER.map(d => (
              <span key={d} className="text-center text-[10px] font-bold text-zinc-400 py-0.5">{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              if (!day) return <span key={`e-${i}`} />;
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const isToday = toIso(day) === toIso(new Date());
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(toIso(day));
                    setOpen(false);
                  }}
                  className={`h-8 w-full flex items-center justify-center rounded-lg text-[11px] font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
                    ${selected
                      ? "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-950 font-bold shadow-sm"
                      : isToday
                        ? "border border-[#0e2d5c]/40 text-zinc-900 dark:text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="mt-3 w-full text-[10px] font-semibold text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors text-center"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
