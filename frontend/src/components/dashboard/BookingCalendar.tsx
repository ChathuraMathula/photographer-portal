import { useState } from "react";
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
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const days = generateCalendarDays(currentDate);

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

      // Search Query (Customer Name or Location or Notes)
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

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all duration-300">
      <CardHeader className="flex flex-col gap-4 border-b border-zinc-150 dark:border-zinc-800/80 pb-5 bg-zinc-50/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0e2d5c]/10 dark:bg-white/10 rounded-xl text-[#0e2d5c] dark:text-white">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-title-medium text-primary-dark dark:text-white">Visual Bookings Grid</CardTitle>
              <CardDescription className="text-body-caption text-zinc-500 mt-0.5">
                Click a day cell to register an offline booking or inspect existing reservations.
              </CardDescription>
            </div>
          </div>
          
          {/* Calendar month/year navigation select dropdowns */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              size="icon"
              variant="outline"
              type="button"
              onClick={onPrevMonth}
              className="h-9 w-9 shrink-0 p-0 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select
              value={currentDate.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-9 min-w-[120px] bg-white dark:bg-zinc-950 font-medium text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="cursor-pointer">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-9 min-w-[90px] bg-white dark:bg-zinc-950 font-medium text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y} className="cursor-pointer">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 mt-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-150/70 dark:border-zinc-850/70 rounded-xl">
          {/* Status Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">Status Filter</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 bg-white dark:bg-zinc-950 text-body-caption border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="cursor-pointer">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">Event Type</span>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="h-10 bg-white dark:bg-zinc-950 text-body-caption border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {EVENT_TYPES.map((e) => (
                  <SelectItem key={e.value} value={e.value} className="cursor-pointer">
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">Search Bookings</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search by client or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 text-body-caption bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-[#0e2d5c] dark:focus-visible:ring-white"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-body-caption text-zinc-500 mb-3 uppercase tracking-wider">
          {DAYS.map((d) => (
            <span key={d} className="title-font text-[11px] font-bold text-zinc-450">{d}</span>
          ))}
        </div>

        {/* Day cells */}
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

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDayClick(day)}
                className={`border p-2 rounded-xl min-h-[85px] text-left relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isToday
                    ? "border-[#0e2d5c] bg-[#0e2d5c]/5 dark:border-white dark:bg-zinc-900/50 hover:bg-[#0e2d5c]/10 dark:hover:bg-zinc-800/80 shadow-inner"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20"
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
                
                {/* Bookings wrapper */}
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
    </Card>
  );
}
