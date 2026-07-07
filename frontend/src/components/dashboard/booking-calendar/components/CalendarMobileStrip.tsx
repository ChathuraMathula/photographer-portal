"use client";

import React from "react";
import { type Reservation } from "@/types";
import { DAYS } from "../constants/calendarConstants";

interface Props {
  activeMonthDays: Date[];
  selectedDay: Date;
  setSelectedDay: (d: Date) => void;
  getReservationsForDay: (day: Date) => Reservation[];
  mobileSliderRef: React.RefObject<HTMLDivElement | null>;
}

export function CalendarMobileStrip({
  activeMonthDays,
  selectedDay,
  setSelectedDay,
  getReservationsForDay,
  mobileSliderRef,
}: Props) {
  return (
    <div
      ref={mobileSliderRef}
      className="flex gap-2 overflow-x-auto py-2 shrink-0 select-none no-scrollbar snap-x"
    >
      {activeMonthDays.map((day) => {
        const isSelected = day.toDateString() === selectedDay.toDateString();
        const isToday = day.toDateString() === new Date().toDateString();
        const dayRes = getReservationsForDay(day);

        return (
          <button
            key={day.toISOString()}
            data-active={isSelected ? "true" : "false"}
            onClick={() => setSelectedDay(day)}
            className={`snap-center flex flex-col items-center justify-center min-w-[50px] h-14 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? "bg-[#0e2d5c] text-white border-[#0e2d5c] dark:bg-white dark:text-zinc-950 dark:border-white shadow-md scale-105"
                : isToday
                  ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-500"
            }`}
          >
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">
              {DAYS[day.getDay()]}
            </span>
            <span className="text-body-base-bold font-bold mt-0.5">
              {day.getDate()}
            </span>
            {dayRes.length > 0 && (
              <span className={`h-1 w-1 rounded-full mt-1 ${isSelected ? 'bg-white dark:bg-zinc-950' : 'bg-blue-600'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
