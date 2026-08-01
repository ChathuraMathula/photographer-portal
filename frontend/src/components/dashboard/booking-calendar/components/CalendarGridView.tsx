"use client";

import React from "react";
import { type Reservation, type LockedDate } from "@/types";
import { CardContent } from "@/components/ui/card";
import { DAYS } from "../constants/calendarConstants";
import { Lock, LockOpen, Plus } from "lucide-react";

interface Props {
  days: (Date | null)[];
  selectedDay: Date;
  loading: boolean;
  lockedDates?: LockedDate[];
  getReservationsForDay: (day: Date) => Reservation[];
  onDayClick: (day: Date) => void;
  onSelectDayOnly?: (day: Date) => void;
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
  onSelectDayOnly,
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
    const isEmpty = dayRes.length === 0 && !isLocked;

    if (loading) {
      return (
        <div
          key={day.toISOString()}
          className="border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl min-h-[95px] sm:min-h-[90px] text-left relative flex flex-col justify-between bg-white dark:bg-zinc-900"
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

    const handleTileClick = () => {
      if (onSelectDayOnly) onSelectDayOnly(day);
      if (isEmpty) {
        onDayClick(day);
      }
    };

    return (
      <div
        key={day.toISOString()}
        onClick={handleTileClick}
        className={`group/tile border p-1 sm:p-1.5 rounded-xl min-h-[95px] sm:min-h-[90px] text-left relative flex flex-col justify-between transition-all duration-200 ${
          isEmpty ? "cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600" : "cursor-default"
        } ${
          isSelected
            ? "border-zinc-900 bg-zinc-50/50 dark:border-white dark:bg-zinc-900/50 shadow-sm ring-1 ring-zinc-900 dark:ring-white"
            : isToday
              ? "border-[#0e2d5c]/60 bg-[#0e2d5c]/5 dark:border-zinc-700/60 dark:bg-zinc-900/10"
              : isLocked
                ? "border-amber-300/80 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/30"
        }`}
      >
        {/* TOP: Date Number */}
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

          {isLocked && (
            <span className="h-4 w-4 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Lock className="h-2.5 w-2.5 shrink-0 fill-amber-500/20" />
            </span>
          )}
        </div>

        {/* MIDDLE: Reservation Buttons */}
        <div className="space-y-1 my-1 flex-1 flex flex-col justify-center overflow-hidden">
          {dayRes.slice(0, 2).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDayReservationClick(r);
              }}
              className="group/item w-full flex items-center justify-between p-0.5 sm:p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs relative text-left"
              title={`Booking: ${r.customer?.firstName ?? "Client"} (${r.startTime} - ${r.endTime})`}
            >
              <div className="flex items-center gap-1 min-w-0">
                <div
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    r.status === "CONFIRMED"
                      ? "bg-emerald-500"
                      : r.status === "PENDING"
                        ? "bg-amber-500"
                        : r.status === "PROPOSED"
                          ? "bg-blue-500"
                          : r.status === "REJECTED"
                            ? "bg-red-500"
                            : r.status === "CANCELLED"
                              ? "bg-zinc-400"
                              : "bg-zinc-300"
                  }`}
                />
                <span className="text-[7.5px] sm:text-[9px] font-bold text-zinc-700 dark:text-zinc-300 truncate leading-none">
                  {r.startTime}
                </span>
              </div>
              <span className="text-[8px] text-zinc-500 truncate hidden sm:block font-medium leading-none">
                {r.customer?.firstName ?? "Client"}
              </span>
            </button>
          ))}
          {dayRes.length > 2 && (
            <div className="text-[7.5px] text-[#0e2d5c] dark:text-zinc-400 font-bold bg-[#0e2d5c]/10 dark:bg-zinc-800/50 py-0.2 px-0.5 rounded text-center truncate">
              +{dayRes.length - 2}
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR: Plus (+) Button & Lock Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-1 border-t border-zinc-150/60 dark:border-zinc-800/80 w-full mt-auto">
          <button
            type="button"
            title="Add Manual Booking for this date"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectDayOnly) onSelectDayOnly(day);
              onDayClick(day);
            }}
            className="h-5 w-5 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="h-3 w-3 shrink-0 text-zinc-600 dark:text-zinc-400" />
          </button>

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
              className={`h-5 w-5 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                isLocked
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:scale-105"
                  : "text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {isLocked ? (
                <Lock className="h-3 w-3 fill-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <LockOpen className="h-3 w-3 opacity-70 hover:opacity-100 shrink-0" />
              )}
            </button>
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
      <div className="grid grid-cols-7 gap-1 sm:gap-2 min-h-[320px] sm:min-h-[350px]">
        {days.map((day, idx) =>
          day ? (
            renderDayContent(day)
          ) : (
            <div
              key={`empty-${idx}`}
              className="bg-zinc-50/20 dark:bg-zinc-950/10 rounded-xl min-h-[95px] sm:min-h-[90px] border border-dashed border-zinc-150 dark:border-zinc-855 opacity-40"
            />
          ),
        )}
      </div>
    </CardContent>
  );
}

