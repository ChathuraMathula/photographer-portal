"use client";

import { useEffect } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { BookingCalendar } from "@/components/dashboard/booking-calendar/BookingCalendar";

export default function CalendarPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const {
    calendarReservations,
    fetchCalendarReservations,
    calendarLoading,
    currentDate,
    setCurrentDate,
    setCalendarSelectedRes,
    manualFormik,
    setShowManualModal,
  } = context;

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    fetchCalendarReservations(startStr, endStr);
  }, [currentDate]);

  return (
    <BookingCalendar
      reservations={calendarReservations}
      currentDate={currentDate}
      loading={calendarLoading}
      onPrevMonth={() =>
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        )
      }
      onNextMonth={() =>
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        )
      }
      onDateChange={setCurrentDate}
      onDayReservationClick={setCalendarSelectedRes}
      onDayClick={(date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const dateStr = String(date.getDate()).padStart(2, "0");
        const formatted = `${year}-${month}-${dateStr}`;
        manualFormik.setFieldValue("date", formatted);
        setShowManualModal(true);
      }}
    />
  );
}
