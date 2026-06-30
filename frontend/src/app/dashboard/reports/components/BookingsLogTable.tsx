"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

type RawBooking = {
  id: string;
  clientName: string;
  date: string;
  eventType: string;
  totalLkr: number;
  status: string;
};

import { Loader2 } from "lucide-react";

type BookingsLogTableProps = {
  bookingsData: any;
  bookingsPage: number;
  setBookingsPage: (page: number) => void;
  bookingsLoading: boolean;
};

export function BookingsLogTable({ bookingsData, bookingsPage, setBookingsPage, bookingsLoading }: BookingsLogTableProps) {
  const rawBookings = bookingsData?.data || [];
  const totalPages = bookingsData?.totalPages || 1;

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850">
        <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">Range Bookings Log</CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          A comprehensive list of all reservations scheduled in the filtered time window.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {bookingsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : rawBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-body-small text-zinc-400 italic">No bookings registered for this range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-small border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-550 border-b border-zinc-100 dark:border-zinc-855">
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {rawBookings.map((res: any) => (
                  <tr key={res.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-855 dark:text-zinc-200">
                      {res.clientName}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {res.eventType}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                      {new Date(res.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                      LKR {res.totalLkr.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        res.status === "CONFIRMED" || res.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250/30"
                          : res.status === "PENDING" || res.status === "PROPOSED"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-250/30"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-250/30"
                      }`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && !bookingsLoading && (
          <div className="p-4 flex justify-center border-t border-zinc-100 dark:border-zinc-850">
            <Pagination
              currentPage={bookingsPage}
              totalPages={totalPages}
              onPageChange={setBookingsPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
