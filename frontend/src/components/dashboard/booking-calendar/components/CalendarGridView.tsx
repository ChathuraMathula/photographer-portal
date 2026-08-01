"use client";

import React from "react";
import { type Reservation, type LockedDate } from "@/types";
import { CardContent } from "@/components/ui/card";
import { DAYS } from "../constants/calendarConstants";
import { Lock, LockOpen } from "lucide-react";

interface Props {
  days: (Date | null)[];
  selectedDay: Date;
  loading: boolean;
  lockedDates?: LockedDate[];
  getReservationsForDay: (day: Date) => Reservation[];
  onDayClick: (day: Date) => void;
  onDayReservationClick: (res: Reservation) => void;
  onLockDayClick?: (day: Date, lockedSlots: LockedDate[]) => void;
}

export function CalendarGridView({
  days,
  selectedDay,
  loading,
  lockedDates = [],
  getReservationsForDay,
  onDayClick,
  onDayReservationClick,
  onLockDayClick,
}: Props) {
  const renderDayContent = (day: Date) => {
    const dayRes = getReservationsForDay(day);
    const isToday = day.toDateString() === new Date().toDateString();
    const isSelected = day.toDateString() === selectedDay.toDateString();

    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${dayStr}`;

    const dayLocks = lockedDates.filter((ld) => ld.date === formattedDate);
    const isLocked = dayLocks.length > 0;

    if (loading) {
      return (
        <div
          key={day.toISOString()}
          className="border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl min-h-[85px] text-left relative flex flex-col justify-between bg-white dark:bg-zinc-900"
        >
          <span className="text-body-caption font-bold inline-flex items-center justify-center rounded-full h-5 w-5 bg-zinc-100 dark:bg-zinc-855 text-zinc-400 dark:text-zinc-550 animate-pulse">
            {day.getDate()}
          </span>
          <div className="space-y-1.5 mt-2 flex-1 flex flex-col justify-end">
            <div className="h-2.5 w-full bg-zinc-150/50 dark:bg-zinc-850/50 rounded animate-pulse" />
            <div className="h-2 w-2/3 bg-zinc-150/50 dark:bg-zinc-850/50 rounded animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div
        key={day.toISOString()}
        onClick={() => {
          onDayClick(day);
        }}
        className={`group/tile border p-1.5 sm:p-2 rounded-xl min-h-[65px] sm:min-h-[85px] text-left relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
          isSelected
            ? "border-zinc-900 bg-zinc-50/50 dark:border-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-zinc-900 dark:ring-white"
            : isToday
              ? "border-[#0e2d5c]/60 bg-[#0e2d5c]/5 dark:border-zinc-700/60 dark:bg-zinc-900/10"
              : isLocked
                ? "border-amber-300/80 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 hover:bg-zinc-50/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-body-caption font-bold inline-flex items-center justify-center rounded-full h-5 w-5 ${
              isToday
                ? "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-500"
            }`}
          >
            {day.getDate()}
          </span>
          {onLockDayClick && (
            <button
              type="button"
              title={
                isLocked ? "Unlock date / time slot" : "Lock date / time slot"
              }
              onClick={(e) => {
                e.stopPropagation();
                onLockDayClick(day, dayLocks);
              }}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                isLocked
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:scale-110"
                  : "text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {isLocked ? (
                <Lock className="h-3 w-3 fill-amber-500/20 text-amber-600 dark:text-amber-400" />
              ) : (
                <LockOpen className="h-3 w-3 opacity-60 hover:opacity-100" />
              )}
            </button>
          )}
        </div>

        <div className="space-y-1 mt-1 sm:mt-2 flex-1 flex flex-col justify-end">
          {dayLocks.map((lock) => (
            <div
              key={lock.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onLockDayClick) onLockDayClick(day, dayLocks);
              }}
              className="flex items-center gap-1 p-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 transition-all duration-150 cursor-pointer shadow-sm relative overflow-hidden"
            >
              <Lock className="h-2.5 w-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="text-[8px] font-bold truncate leading-none hidden sm:inline">
                {lock.startTime === "00:00" && lock.endTime === "23:59"
                  ? "Locked"
                  : `${lock.startTime}-${lock.endTime}`}
              </span>
              <span className="text-[8px] font-bold truncate leading-none sm:hidden">
                Locked
              </span>
            </div>
          ))}

          {dayRes.slice(0, 3).map((r) => (
            <div
              key={r.id}
              onClick={(e) => {
                e.stopPropagation();
                onDayReservationClick(r);
              }}
              className="group/item flex flex-col p-0.5 sm:p-1 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/80 transition-all duration-150 cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[8px] sm:text-[9px] font-bold text-zinc-700 dark:text-zinc-300 truncate leading-none">
                  {r.startTime}
                </span>
                <div
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${r.status === "CONFIRMED" ? "bg-emerald-500" : r.status === "PENDING" ? "bg-amber-500" : r.status === "PROPOSED" ? "bg-blue-500" : r.status === "REJECTED" ? "bg-red-500" : r.status === "CANCELLED" ? "bg-zinc-400" : "bg-zinc-300"}`}
                />
              </div>
              <span className="text-[8px] text-zinc-500 truncate hidden sm:block font-medium leading-none mt-1">
                {r.customer?.firstName ?? "Client"}
              </span>
            </div>
          ))}
          {dayRes.length > 3 && (
            <div className="text-[8px] text-[#0e2d5c] dark:text-zinc-400 font-bold bg-[#0e2d5c]/10 dark:bg-zinc-800/50 py-0.5 px-1 rounded text-center">
              +{dayRes.length - 3}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <CardContent className="pt-4 sm:pt-6">
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-body-caption text-zinc-500 mb-2 sm:mb-3 uppercase tracking-wider">
        {DAYS.map((d) => (
          <span
            key={d}
            className="title-font text-[10px] sm:text-[11px] font-bold text-zinc-455"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 min-h-[300px] sm:min-h-[350px]">
        {days.map((day, idx) =>
          day ? (
            renderDayContent(day)
          ) : (
            <div
              key={`empty-${idx}`}
              className="bg-zinc-50/20 dark:bg-zinc-950/10 rounded-xl min-h-[65px] sm:min-h-[85px] border border-dashed border-zinc-150 dark:border-zinc-850 opacity-40"
            />
          ),
        )}
      </div>
    </CardContent>
  );
}

