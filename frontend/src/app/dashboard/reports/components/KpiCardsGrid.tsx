"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, Percent } from "lucide-react";

type KpiCardsGridProps = {
  summary: {
    totalBookings: number;
    potentialRevenueLkr: number;
    paidRevenueLkr: number;
    pendingRevenueLkr: number;
    conversionRate: number;
  };
};

export function KpiCardsGrid({ summary }: KpiCardsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Potential Volume Card */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Potential Volume
          </CardTitle>
          <DollarSign className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
            LKR {summary.potentialRevenueLkr.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Total contract values in range
          </p>
        </CardContent>
      </Card>

      {/* Paid Earnings Card */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Paid Earnings
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
            LKR {summary.paidRevenueLkr.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-1">
            LKR {summary.pendingRevenueLkr.toLocaleString()} Pending
          </p>
        </CardContent>
      </Card>

      {/* Total Bookings Card */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Bookings
          </CardTitle>
          <Calendar className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
            {summary.totalBookings}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Reservations submitted
          </p>
        </CardContent>
      </Card>

      {/* Conversion Ratio Card */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Conversion Ratio
          </CardTitle>
          <Percent className="h-4 w-4 text-blue-600 dark:text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
            {summary.conversionRate}%
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Confirmed/Completed ratio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
