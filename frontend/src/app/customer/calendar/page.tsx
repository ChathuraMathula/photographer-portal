"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Calendar as CalendarIcon, Clock, MapPin, ExternalLink, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";

interface CustomerReservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location: string;
  city?: string;
  status: string;
  photographer?: {
    firstName: string;
    lastName: string;
  };
}

export default function CustomerCalendarPage() {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayRes, setSelectedDayRes] = useState<CustomerReservation[]>([]);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/customer/reservations`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setReservations(data || []);
        }
      } catch (err) {
        console.error("Error fetching customer calendar reservations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [auth, router, API]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const getReservationsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return reservations.filter((r) => r.date.startsWith(dateStr));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300";
      case "PROPOSED":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0e2d5c]/10 text-[#0e2d5c] dark:bg-blue-400/10 dark:text-blue-400 flex items-center justify-center font-bold">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  My Photography Calendar
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  View and manage all your scheduled photoshoot dates and sessions.
                </p>
              </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-9 px-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold min-w-[130px] text-center text-zinc-900 dark:text-white">
                {monthName} {year}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-9 px-2.5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-28 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/40 opacity-30" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayReservations = getReservationsForDate(dayNum);
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-20 sm:h-28 rounded-xl p-1.5 sm:p-2 border transition-all flex flex-col justify-between ${
                    isToday
                      ? "border-[#0e2d5c] dark:border-blue-400 bg-[#0e2d5c]/5 dark:bg-blue-400/5 font-bold"
                      : "border-zinc-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        isToday
                          ? "h-5 w-5 rounded-full bg-[#0e2d5c] text-white flex items-center justify-center text-[10px]"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {dayNum}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayReservations.map((res) => (
                      <Link
                        key={res.id}
                        href={`/customer/reservations/${res.id}`}
                        className={`block text-[10px] p-1 rounded-md border truncate font-semibold transition-all hover:scale-102 ${getStatusBadge(res.status)}`}
                        title={`${res.eventType} - ${res.startTime}`}
                      >
                        <span className="truncate block font-bold">
                          {res.eventType}
                        </span>
                        <span className="text-[9px] opacity-80 block truncate">
                          {res.startTime}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
