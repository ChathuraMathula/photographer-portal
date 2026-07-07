"use client";

import { useState, useEffect } from "react";
import { type Reservation } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { generateCalendarDays, formatDateLocal } from "../utils/calendarHelpers";

export function useBookingCalendarState(
  reservations: Reservation[],
  currentDate: Date,
  onDateChange?: (date: Date) => void
) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const days = generateCalendarDays(currentDate);

  useEffect(() => {
    const today = new Date();
    if (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()) {
      setSelectedDay(today);
    } else {
      setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }
  }, [currentDate]);

  const handleMonthChange = (val: string) => {
    if (onDateChange) onDateChange(new Date(currentDate.getFullYear(), parseInt(val), 1));
  };

  const handleYearChange = (val: string) => {
    if (onDateChange) onDateChange(new Date(parseInt(val), currentDate.getMonth(), 1));
  };

  const getReservationsForDay = (day: Date) => {
    const formatted = formatDateLocal(day);
    return reservations.filter((r) => {
      const resDate = typeof r.date === "string" ? r.date.split("T")[0] : formatDateLocal(new Date(r.date));
      if (resDate !== formatted) return false;
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (eventTypeFilter !== "ALL" && r.eventType !== eventTypeFilter) return false;

      if (debouncedSearch.trim() !== "") {
        const q = debouncedSearch.toLowerCase();
        const first = r.customer?.firstName?.toLowerCase() ?? "";
        const last = r.customer?.lastName?.toLowerCase() ?? "";
        const loc = r.location?.toLowerCase() ?? "";
        const type = r.eventType.toLowerCase();
        if (!first.includes(q) && !last.includes(q) && !loc.includes(q) && !type.includes(q)) return false;
      }
      return true;
    });
  };

  const activeMonthDays = days.filter((d): d is Date => d !== null);
  const selectedDayReservations = getReservationsForDay(selectedDay);

  return {
    statusFilter,
    setStatusFilter,
    eventTypeFilter,
    setEventTypeFilter,
    searchQuery,
    setSearchQuery,
    selectedDay,
    setSelectedDay,
    days,
    activeMonthDays,
    selectedDayReservations,
    handleMonthChange,
    handleYearChange,
    getReservationsForDay,
  };
}
