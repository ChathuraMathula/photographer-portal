"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PackagePerformanceBar } from "../charts";
import { BookingsLogTable } from "./BookingsLogTable";

type Props = {
  packages: Array<{ name: string; count: number; revenueLkr: number }>;
  rawBookings: Array<{
    id: string;
    clientName: string;
    date: string;
    eventType: string;
    totalLkr: number;
    status: string;
  }>;
};

export function PhotographerPerformanceBreakdown({ packages, rawBookings }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Package Performance */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Popular Packages</CardTitle>
          <CardDescription className="text-xs">Your packages ranked by earnings and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <PackagePerformanceBar data={packages} />
        </CardContent>
      </Card>

      {/* Bookings log table */}
      <BookingsLogTable bookings={rawBookings} />
    </div>
  );
}
