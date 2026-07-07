"use client";
import React from "react";
import { type Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Tag, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/feedback/StatusBadge";

interface Props {
  selectedDay: Date;
  loading: boolean;
  selectedDayReservations: Reservation[];
  onDayClick: (day: Date) => void;
  onDayReservationClick: (res: Reservation) => void;
}

export function CalendarSelectedDayList({
  selectedDay,
  loading,
  selectedDayReservations,
  onDayClick,
  onDayReservationClick,
}: Props) {
  const formattedDay = selectedDay.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between w-full border-b border-zinc-100 dark:border-zinc-800 pb-2">
        <h4 className="text-body-small-s font-extrabold text-zinc-900 dark:text-white text-left">
          Agenda: {formattedDay}
        </h4>
        <Button
          size="sm"
          onClick={() => onDayClick(selectedDay)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-8 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Booking
        </Button>
      </div>
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={`skeleton-mobile-${i}`}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-xl shadow-sm space-y-2.5 animate-pulse"
              >
                <div className="h-4 w-1/3 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                <div className="h-3 w-1/2 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
              </div>
            ))}
          </div>
        ) : selectedDayReservations.length > 0 ? (
          selectedDayReservations.map((r) => (
            <div
              key={r.id}
              onClick={() => onDayReservationClick(r)}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-xl shadow-sm space-y-2.5 text-left cursor-pointer hover:border-zinc-300 transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {r.customer?.firstName} {r.customer?.lastName}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>
                      {r.startTime} - {r.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span>{r.eventType}</span>
                  </div>
                </div>
                {r.location && (
                  <div className="flex items-center gap-1 text-[10px] text-zinc-450 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{r.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-zinc-50/20 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-[11px] text-zinc-400 italic font-medium">
              No bookings scheduled for this date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
