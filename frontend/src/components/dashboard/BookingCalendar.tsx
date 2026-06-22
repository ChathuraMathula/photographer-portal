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
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="text-lg">Visual Bookings Grid</CardTitle>
          <CardDescription>
            Click a day slot to inspect photographer reservations
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm w-32 text-center">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button size="icon" variant="outline" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-zinc-500 mb-2">
          {DAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2 min-h-[300px]">
          {days.map((day, idx) => {
            if (!day)
              return (
                <div
                  key={`empty-${idx}`}
                  className="bg-zinc-50/25 dark:bg-zinc-950/10 rounded-lg min-h-[70px]"
                />
              );

            const dayRes = getReservationsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`border p-2 rounded-lg min-h-[75px] text-left relative flex flex-col justify-between transition-colors ${
                  isToday
                    ? "border-zinc-900 bg-zinc-50/50 dark:border-white dark:bg-zinc-900"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    isToday ? "text-zinc-900 dark:text-white" : "text-zinc-500"
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="space-y-1 mt-1">
                  {dayRes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onDayReservationClick(r)}
                      className="cursor-pointer"
                    >
                      <StatusPill status={r.status} />
                      <span className="text-[9px] text-zinc-500 truncate block">
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
