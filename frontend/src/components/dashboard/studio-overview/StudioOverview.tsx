"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePhotographerDashboardContext } from "@/app/dashboard/context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import { StatusBadge } from "@/components/feedback/StatusBadge";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface CapacityInfo {
  used: number;
  max: number;
  plan: string;
}

export function StudioOverview() {
  const router = useRouter();
  const context = usePhotographerDashboardContext();

  const [capacity, setCapacity] = useState<CapacityInfo>({
    used: 1,
    max: 5,
    plan: "FREE",
  });
  const [loadingCapacity, setLoadingCapacity] = useState(false);

  useEffect(() => {
    async function fetchCapacity() {
      if (!context?.authFetch) return;
      try {
        setLoadingCapacity(true);
        const res = await context.authFetch(`${API}/studios/my/photographers`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.capacity) {
            setCapacity(data.capacity);
          }
        }
      } catch (err) {
        console.error("Failed to load studio capacity:", err);
      } finally {
        setLoadingCapacity(false);
      }
    }

    fetchCapacity();
  }, [context?.authFetch]);

  const reservations = context?.reservations || [];
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED").length;
  const pendingCount = reservations.filter((r) => r.status === "PENDING").length;
  const proposedCount = reservations.filter((r) => r.status === "PROPOSED").length;

  const totalRevenueCents = reservations
    .filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED")
    .reduce((sum, r) => sum + (r.advancePaymentPriceInCents || 0), 0);

  const formattedRevenue = (totalRevenueCents / 100).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold border border-white/20">
              <Building2 className="h-3.5 w-3.5 text-blue-300" />
              Studio Management Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Welcome back, {context?.firstName || "Studio Manager"}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl leading-relaxed">
              Track multi-photographer bookings, assign incoming reservations to your studio staff, and monitor team performance in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => router.push("/dashboard/photographers")}
              className="bg-white hover:bg-blue-50 text-[#0e2d5c] font-bold text-xs h-11 px-5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Manage Team
            </Button>
            <Button
              onClick={() => router.push("/dashboard/calendar")}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs h-11 px-5 rounded-xl border border-white/20 backdrop-blur-md cursor-pointer transition-all flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Studio Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-900 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Settled Advance Revenue
            </p>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {formattedRevenue}
            </h3>
          </div>
        </Card>

        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-900 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Confirmed Bookings
            </p>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {confirmedCount}
            </h3>
          </div>
        </Card>

        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-900 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Pending Requests
            </p>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {pendingCount}
            </h3>
          </div>
        </Card>

        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm rounded-2xl bg-white dark:bg-zinc-900 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Team Members
            </p>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
              {capacity.used} / {capacity.max}
            </h3>
          </div>
        </Card>
      </div>

      {/* Team Quota & Recent Requests Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Studio Reservation Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
              Recent Studio Reservations ({reservations.length})
            </h2>
            <Link
              href="/dashboard/reservations"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All Reservations
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {reservations.length === 0 ? (
            <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl">
              <p className="text-xs text-zinc-500">
                No reservation requests received yet. Share your studio booking link to start getting bookings!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 5).map((r) => (
                <Card
                  key={r.id}
                  onClick={() => router.push(`/dashboard/reservations?id=${r.id}`)}
                  className="border border-zinc-200/70 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs bg-white dark:bg-zinc-900 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {r.customer?.firstName} {r.customer?.lastName}
                      </h4>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                      <span>{r.eventType}</span>
                      <span>•</span>
                      <span>
                        {new Date(r.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} ({r.startTime} - {r.endTime})
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                      Manage Request
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Studio Plan & Team Capacity Card */}
        <div className="space-y-6">
          <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Studio Plan & Capacity
                </h3>
                <p className="text-xs text-zinc-500">
                  Current subscription limit
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                {capacity.plan} PLAN
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Team Capacity Quota</span>
                <span>
                  {capacity.used} / {capacity.max} Photographers
                </span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (capacity.used / capacity.max) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Studio accounts can assign bookings to registered team members and monitor schedule availability.
            </p>

            <Button
              onClick={() => router.push("/dashboard/photographers")}
              className="w-full bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs h-11 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Manage Studio Team
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
