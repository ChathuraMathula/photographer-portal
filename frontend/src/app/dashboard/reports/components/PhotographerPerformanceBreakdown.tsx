"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PackagePerformanceBar } from "../charts";
import { BookingsLogTable } from "./BookingsLogTable";

type Props = {
  packages: Array<{ name: string; count: number; revenueLkr: number }>;
  bookingsData: any;
  bookingsPage: number;
  setBookingsPage: (page: number) => void;
  bookingsLoading: boolean;
};

export function PhotographerPerformanceBreakdown({ packages, bookingsData, bookingsPage, setBookingsPage, bookingsLoading }: Props) {
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
      <BookingsLogTable 
        bookingsData={bookingsData} 
        bookingsPage={bookingsPage} 
        setBookingsPage={setBookingsPage} 
        bookingsLoading={bookingsLoading} 
      />
    </div>
  );
}
