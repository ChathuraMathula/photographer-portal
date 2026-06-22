import { type Reservation } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/common/StatusBadge";

type Props = {
  reservations: Reservation[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayReservationClick: (res: Reservation) => void;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  onDayReservationClick,
}: Props) {
  const days = generateCalendarDays(currentDate);

  const getReservationsForDay = (day: Date) => {
    const formatted = day.toISOString().split("T")[0];
    return reservations.filter((r) => {
      const resDate = new Date(r.date).toISOString().split("T")[0];
      return resDate === formatted;
    });
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4 bg-zinc-50/20">
        <div>
          <CardTitle className="text-title-medium text-primary-dark dark:text-white">Visual Bookings Grid</CardTitle>
          <CardDescription className="text-body-small text-zinc-500 mt-1">
            Click a day slot to inspect photographer reservations
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={onPrevMonth}
            className="btn btn-secondary h-9 w-9 shrink-0 p-0 shadow-sm min-w-0 md:min-w-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-body-small-s font-semibold w-32 text-center text-primary-dark dark:text-white">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={onNextMonth}
            className="btn btn-secondary h-9 w-9 shrink-0 p-0 shadow-sm min-w-0 md:min-w-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-body-caption text-zinc-550 mb-3">
          {DAYS.map((d) => (
            <span key={d} className="title-font">{d}</span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2 min-h-[300px]">
          {days.map((day, idx) => {
            if (!day)
              return (
                <div
                  key={`empty-${idx}`}
                  className="bg-zinc-50/25 dark:bg-zinc-950/10 rounded-xl min-h-[70px] border border-transparent"
                />
              );

            const dayRes = getReservationsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`border p-2 rounded-xl min-h-[75px] text-left relative flex flex-col justify-between transition-colors ${
                  isToday
                    ? "border-primary-dark bg-zinc-50/50 dark:border-white dark:bg-zinc-900"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700"
                }`}
              >
                <span
                  className={`text-body-caption font-bold ${
                    isToday ? "text-primary-dark dark:text-white" : "text-zinc-500"
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="space-y-1 mt-1">
                  {dayRes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onDayReservationClick(r)}
                      className="cursor-pointer hover:opacity-80"
                    >
                      <StatusPill status={r.status} />
                      <span className="text-[9px] text-zinc-550 truncate block mt-0.5 font-medium leading-none">
                        {r.startTime} {r.customer.firstName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
