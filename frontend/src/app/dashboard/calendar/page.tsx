"use client";

import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";

export default function CalendarPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const {
    reservations,
    currentDate,
    setCurrentDate,
    setCalendarSelectedRes,
    manualFormik,
    setShowManualModal,
  } = context;

  return (
    <BookingCalendar
      reservations={reservations}
      currentDate={currentDate}
      onPrevMonth={() =>
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        )
      }
      onNextMonth={() =>
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
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
