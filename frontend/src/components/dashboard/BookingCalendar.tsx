"use client";

import { useState, useEffect, useRef } from "react";
import { type Reservation } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, MapPin, Clock, Plus, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StatusBadge } from "@/components/common/StatusBadge";

type Props = {
  reservations: Reservation[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateChange?: (date: Date) => void;
  onDayReservationClick: (res: Reservation) => void;
  onDayClick: (date: Date) => void;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  { name: "January", value: "0" },
  { name: "February", value: "1" },
  { name: "March", value: "2" },
  { name: "April", value: "3" },
  { name: "May", value: "4" },
  { name: "June", value: "5" },
  { name: "July", value: "6" },
  { name: "August", value: "7" },
  { name: "September", value: "8" },
  { name: "October", value: "9" },
  { name: "November", value: "10" },
  { name: "December", value: "11" },
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029"];

const STATUSES = [
  { name: "All Statuses", value: "ALL" },
  { name: "Pending", value: "PENDING" },
  { name: "Proposed", value: "PROPOSED" },
  { name: "Confirmed", value: "CONFIRMED" },
  { name: "Completed", value: "COMPLETED" },
  { name: "Cancelled", value: "CANCELLED" },
  { name: "Rejected", value: "REJECTED" },
];

const EVENT_TYPES = [
  { name: "All Events", value: "ALL" },
  { name: "Wedding", value: "Wedding" },
  { name: "Portrait", value: "Portrait" },
  { name: "Engagement", value: "Engagement" },
  { name: "Corporate Event", value: "Corporate Event" },
  { name: "Newborn", value: "Newborn" },
  { name: "Fashion", value: "Fashion" },
  { name: "Sports", value: "Sports" },
  { name: "Landscape", value: "Landscape" },
  { name: "Event Party", value: "Event Party" },
  { name: "Other", value: "Other" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function generateCalendarDays(currentDate: Date): (Date | null)[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = getDaysInMonth(year, month);
  const startOffset = getFirstDayOfMonth(year, month);

  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysCount; i++) days.push(new Date(year, month, i));
  return days;
}

export function BookingCalendar({
  reservations,
  currentDate,
  onPrevMonth,
  onNextMonth,
  onDateChange,
  onDayReservationClick,
  onDayClick,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  const days = generateCalendarDays(currentDate);

  // Sync selectedDay with month transitions
  useEffect(() => {
    const today = new Date();
    if (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()) {
      setSelectedDay(today);
    } else {
      setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }
  }, [currentDate]);

  // Center selected active day in horizontal mobile strip scroll
  useEffect(() => {
    if (mobileSliderRef.current) {
      const activeBtn = mobileSliderRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedDay]);

  const formatDateLocal = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dateStr = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${dateStr}`;
  };

  const handleMonthChange = (val: string) => {
    if (onDateChange) {
      onDateChange(new Date(currentDate.getFullYear(), parseInt(val), 1));
    }
  };

  const handleYearChange = (val: string) => {
    if (onDateChange) {
      onDateChange(new Date(parseInt(val), currentDate.getMonth(), 1));
    }
  };

  // Day navigation controls
  const handlePrevDay = () => {
    const prev = new Date(selectedDay);
    prev.setDate(selectedDay.getDate() - 1);
    setSelectedDay(prev);
    if (prev.getMonth() !== currentDate.getMonth() || prev.getFullYear() !== currentDate.getFullYear()) {
      if (onDateChange) {
        onDateChange(new Date(prev.getFullYear(), prev.getMonth(), 1));
      }
    }
  };

  const handleNextDay = () => {
    const next = new Date(selectedDay);
    next.setDate(selectedDay.getDate() + 1);
    setSelectedDay(next);
    if (next.getMonth() !== currentDate.getMonth() || next.getFullYear() !== currentDate.getFullYear()) {
      if (onDateChange) {
        onDateChange(new Date(next.getFullYear(), next.getMonth(), 1));
      }
    }
  };

  const getReservationsForDay = (day: Date) => {
    const formatted = formatDateLocal(day);
    return reservations.filter((r) => {
      const resDate =
        typeof r.date === "string" ? r.date.split("T")[0] : formatDateLocal(new Date(r.date));
      if (resDate !== formatted) return false;

      // Status Filter
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;

      // Event Type Filter
      if (eventTypeFilter !== "ALL" && r.eventType !== eventTypeFilter) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const firstName = r.customer?.firstName?.toLowerCase() ?? "";
        const lastName = r.customer?.lastName?.toLowerCase() ?? "";
        const location = r.location?.toLowerCase() ?? "";
        const eventType = r.eventType.toLowerCase();

        if (
          !firstName.includes(query) &&
          !lastName.includes(query) &&
          !location.includes(query) &&
          !eventType.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  };

  const activeMonthDays = days.filter((d): d is Date => d !== null);
  const selectedDayReservations = getReservationsForDay(selectedDay);

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all duration-300">
      <CardHeader className="flex flex-col gap-4 border-b border-zinc-150 dark:border-zinc-800/80 pb-5 bg-zinc-50/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0e2d5c]/10 dark:bg-white/10 rounded-xl text-[#0e2d5c] dark:text-white">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white leading-none">Visual Bookings Grid</CardTitle>
              <CardDescription className="text-body-caption text-zinc-500 mt-1.5">
                Navigate months or days, adjust search criteria, and configure settings.
              </CardDescription>
            </div>
          </div>
          
          {/* Calendar Month & Day Navigation Options */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Day Navigators */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/40">
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={handlePrevDay}
                className="h-8 px-2.5 text-zinc-700 dark:text-zinc-350 cursor-pointer text-[10px] font-bold"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Prev Day
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={handleNextDay}
                className="h-8 px-2.5 text-zinc-700 dark:text-zinc-350 cursor-pointer text-[10px] font-bold"
              >
                Next Day
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {/* Month Navigators */}
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                type="button"
                onClick={onPrevMonth}
                className="h-9 w-9 shrink-0 p-0 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Searchable dropdowns with 50px height for Month/Year */}
              <div className="w-[110px]">
                <SearchableSelect
                  options={MONTHS}
                  value={currentDate.getMonth().toString()}
                  onValueChange={handleMonthChange}
                />
              </div>
   
              <div className="w-[85px]">
                <SearchableSelect
                  options={YEARS.map((y) => ({ name: y, value: y }))}
                  value={currentDate.getFullYear().toString()}
                  onValueChange={handleYearChange}
                />
              </div>
   
              <Button
                size="icon"
                variant="outline"
                type="button"
                onClick={onNextMonth}
                className="h-9 w-9 shrink-0 p-0 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
 
        {/* Filter bar: now using premium 50px Searchable Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 mt-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-150/70 dark:border-zinc-850/70 rounded-xl">
          {/* Status Select */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">Status Filter</span>
            <SearchableSelect
              options={STATUSES}
              value={statusFilter}
              onValueChange={setStatusFilter}
            />
          </div>
 
          {/* Event Type Select */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">Event Type</span>
            <SearchableSelect
              options={EVENT_TYPES}
              value={eventTypeFilter}
              onValueChange={setEventTypeFilter}
            />
          </div>
 
          {/* Search Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">Search Bookings</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by client or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[50px] w-full pl-9 pr-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-medium text-body-small focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      {/* ── DESKTOP MONTH VIEW ────────────────────────────────────────────────── */}
      <CardContent className="pt-6 hidden sm:block">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-body-caption text-zinc-500 mb-3 uppercase tracking-wider">
          {DAYS.map((d) => (
            <span key={d} className="title-font text-[11px] font-bold text-zinc-450">{d}</span>
          ))}
        </div>
 
        <div className="grid grid-cols-7 gap-2 min-h-[350px]">
          {days.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="bg-zinc-50/20 dark:bg-zinc-950/10 rounded-xl min-h-[85px] border border-dashed border-zinc-150 dark:border-zinc-850 opacity-40"
                />
              );
            }
 
            const dayRes = getReservationsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDay.toDateString();
 
            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDay(day);
                  onDayClick(day);
                }}
                className={`border p-2 rounded-xl min-h-[85px] text-left relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-50/50 dark:border-white dark:bg-zinc-900/50 shadow-sm"
                    : isToday
                      ? "border-[#0e2d5c]/60 bg-[#0e2d5c]/5 dark:border-zinc-700/60 dark:bg-zinc-900/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 hover:bg-zinc-50/30"
                }`}
              >
                <span
                  className={`text-body-caption font-bold inline-flex items-center justify-center rounded-full h-5 w-5 ${
                    isToday 
                      ? "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900" 
                      : "text-zinc-500"
                  }`}
                >
                  {day.getDate()}
                </span>
                
                {/* Bookings list */}
                <div className="space-y-1 mt-2 flex-1 flex flex-col justify-end">
                  {dayRes.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDayReservationClick(r);
                      }}
                      className="group/item flex flex-col p-1 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/80 transition-all duration-150 cursor-pointer shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 truncate leading-none">
                          {r.startTime}
                        </span>
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          r.status === "CONFIRMED" ? "bg-emerald-500" :
                          r.status === "PENDING" ? "bg-amber-500" :
                          r.status === "PROPOSED" ? "bg-blue-500" :
                          r.status === "REJECTED" ? "bg-red-500" :
                          r.status === "CANCELLED" ? "bg-zinc-400" : "bg-zinc-300"
                        }`} />
                      </div>
                      <span className="text-[8px] text-zinc-500 truncate block font-medium leading-none mt-1">
                        {r.customer?.firstName ?? "Client"}
                      </span>
                    </div>
                  ))}
                  
                  {dayRes.length > 3 && (
                    <div className="text-[8px] text-[#0e2d5c] dark:text-zinc-400 font-bold bg-[#0e2d5c]/10 dark:bg-zinc-800/50 py-0.5 px-1.5 rounded text-center">
                      +{dayRes.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* ── MOBILE AGENDA VIEW ────────────────────────────────────────────────── */}
      <CardContent className="pt-4 block sm:hidden px-4 space-y-4">
        {/* Horizontal Days Strip Slider */}
        <div ref={mobileSliderRef} className="flex gap-2 overflow-x-auto py-2 shrink-0 select-none no-scrollbar snap-x">
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

        {/* Selected Date Agenda with Date-by-Date Navs */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
            
            {/* Mobile day-by-day navigators */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handlePrevDay}
                  className="h-8 w-8 cursor-pointer rounded-lg border-zinc-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h4 className="text-body-small-s font-extrabold text-zinc-900 dark:text-white text-left">
                  {selectedDay.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                </h4>
  
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleNextDay}
                  className="h-8 w-8 cursor-pointer rounded-lg border-zinc-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="sm"
                onClick={() => onDayClick(selectedDay)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-8 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>

          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {selectedDayReservations.length > 0 ? (
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
                        <span>{r.startTime} - {r.endTime}</span>
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
                <p className="text-[11px] text-zinc-400 italic">No bookings scheduled for this date.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
