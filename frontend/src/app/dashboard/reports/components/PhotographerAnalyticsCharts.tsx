"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueAreaChart, BookingStatusDonut } from "../charts";

type Props = {
  timeline: Array<{ label: string; bookings: number; revenueLkr: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
};

export function PhotographerAnalyticsCharts({ timeline, statusDistribution }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Revenue Timeline</CardTitle>
          <CardDescription className="text-xs">Your financial timeline representation</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart data={timeline} />
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Booking Status</CardTitle>
          <CardDescription className="text-xs">Current reservation statuses conversion</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <BookingStatusDonut data={statusDistribution} />
        </CardContent>
      </Card>
    </div>
  );
}
