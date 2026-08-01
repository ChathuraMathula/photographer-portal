"use client";

import { useRef, useEffect } from "react";
import { type Reservation, type LockedDate } from "@/types";
import { Card } from "@/components/ui/card";
import { useBookingCalendarState } from "./hooks/useBookingCalendarState";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarGridView } from "./components/CalendarGridView";
import { CalendarSelectedDayList } from "./components/CalendarSelectedDayList";

type Props = {
  reservations: Reservation[];
  lockedDates?: LockedDate[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange?: (date: Date) => void;
  onDayReservationClick: (res: Reservation) => void;
  onDayClick: (date: Date) => void;
  onLockDayClick?: (day: Date, lockedSlots: LockedDate[]) => void;
  loading?: boolean;
};

export function BookingCalendar(props: Props) {
  const state = useBookingCalendarState(
    props.reservations,
    props.currentDate,
    props.onDateChange,
  );
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileSliderRef.current) {
      const activeBtn = mobileSliderRef.current.querySelector(
        '[data-active="true"]',
      );
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [state.selectedDay]);

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all duration-300">
      <CalendarHeader
        currentDate={props.currentDate}
        onPrevMonth={props.onPrevMonth}
        onNextMonth={props.onNextMonth}
        handleMonthChange={state.handleMonthChange}
        handleYearChange={state.handleYearChange}
        statusFilter={state.statusFilter}
        setStatusFilter={state.setStatusFilter}
        eventTypeFilter={state.eventTypeFilter}
        setEventTypeFilter={state.setEventTypeFilter}
        searchQuery={state.searchQuery}
        setSearchQuery={state.setSearchQuery}
      />

      <CalendarGridView
        days={state.days}
        selectedDay={state.selectedDay}
        loading={props.loading || false}
        lockedDates={props.lockedDates}
        getReservationsForDay={state.getReservationsForDay}
        onSelectDayOnly={(day) => {
          state.setSelectedDay(day);
        }}
        onDayClick={(day) => {
          state.setSelectedDay(day);
          props.onDayClick(day);
        }}
        onDayReservationClick={props.onDayReservationClick}
        onLockDayClick={props.onLockDayClick}
      />

      <div className="pt-4 block sm:hidden px-4 space-y-4 pb-4">
        <CalendarSelectedDayList
          selectedDay={state.selectedDay}
          loading={props.loading || false}
          selectedDayReservations={state.selectedDayReservations}
          onDayClick={props.onDayClick}
          onDayReservationClick={props.onDayReservationClick}
        />
      </div>
    </Card>
  );
}
