"use client";

import { useEffect, useState } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { BookingCalendar } from "@/components/dashboard/booking-calendar/BookingCalendar";
import { LockDateModal } from "@/components/modals/LockDateModal";
import { UnlockDateModal } from "@/components/modals/UnlockDateModal";
import { type LockedDate } from "@/types";

export default function CalendarPage() {
  const context = usePhotographerDashboardContext();

  const [selectedLockDay, setSelectedLockDay] = useState<Date | null>(null);
  const [selectedLockSlots, setSelectedLockSlots] = useState<LockedDate[]>([]);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

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
    lockedDates,
    fetchLockedDates,
    lockDate,
    unlockDate,
  } = context;

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    fetchCalendarReservations(startStr, endStr);
    fetchLockedDates(startStr, endStr);
  }, [currentDate]);

  const handleLockDayClick = (date: Date, lockedSlots: LockedDate[]) => {
    setSelectedLockDay(date);
    setSelectedLockSlots(lockedSlots);
    if (lockedSlots.length > 0) {
      setShowUnlockModal(true);
    } else {
      setShowLockModal(true);
    }
  };

  return (
    <>
      <BookingCalendar
        reservations={calendarReservations}
        lockedDates={lockedDates}
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
        onLockDayClick={handleLockDayClick}
        onDayClick={(date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const dateStr = String(date.getDate()).padStart(2, "0");
          const formatted = `${year}-${month}-${dateStr}`;
          manualFormik.setFieldValue("date", formatted);
          setShowManualModal(true);
        }}
      />

      <LockDateModal
        isOpen={showLockModal}
        date={selectedLockDay}
        onClose={() => setShowLockModal(false)}
        onConfirm={async (data) => {
          await lockDate(data);
        }}
      />

      <UnlockDateModal
        isOpen={showUnlockModal}
        date={selectedLockDay}
        lockedSlots={selectedLockSlots}
        onClose={() => setShowUnlockModal(false)}
        onConfirmUnlock={async (id) => {
          await unlockDate(id);
          setSelectedLockSlots((prev) => prev.filter((s) => s.id !== id));
        }}
      />
    </>
  );
}

