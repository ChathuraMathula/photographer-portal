import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueAreaChart, BookingStatusDonut, PackagePerformanceBar } from "@/app/dashboard/reports/charts";
import { Loader2 } from "lucide-react";

type Props = {
  reportData: any;
  loading: boolean;
  refreshing: boolean;
};

export function AdminReportsCharts({ reportData, loading, refreshing }: Props) {
  if (loading) {
    return (
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl min-h-[350px] flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50"><Loader2 className="h-8 w-8 text-zinc-400 animate-spin" /></Card>
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl min-h-[350px] flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50"><Loader2 className="h-8 w-8 text-zinc-400 animate-spin" /></Card>
      </section>
    );
  }
  if (!reportData) return null;

  return (
    <>
      <section className="grid gap-6 md:grid-cols-3 relative">
        {refreshing && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[1px] rounded-xl"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}
        <Card className="md:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl min-h-[350px]">
          <CardHeader><CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Platform Revenue Trend</CardTitle><CardDescription className="text-xs">Timeline representation of cash logs &amp; card payouts</CardDescription></CardHeader>
          <CardContent><RevenueAreaChart data={reportData.timeline} /></CardContent>
        </Card>
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl min-h-[350px]">
          <CardHeader><CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Reservation Status</CardTitle><CardDescription className="text-xs">Platform booking states conversion breakdown</CardDescription></CardHeader>
          <CardContent className="flex items-center justify-center min-h-[250px]"><BookingStatusDonut data={reportData.statusDistribution} /></CardContent>
        </Card>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader><CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Popular Packages</CardTitle><CardDescription className="text-xs">Aggregated package usage across the platform</CardDescription></CardHeader>
          <CardContent><PackagePerformanceBar data={reportData.packages} /></CardContent>
        </Card>
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader><CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Platform Event Types</CardTitle><CardDescription className="text-xs">Breakdown of event types booked by customers</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {reportData.eventTypes.length === 0 ? <p className="text-body-caption text-zinc-450 italic">No event types recorded</p> : (
                reportData.eventTypes.map((et: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-150/40 dark:border-zinc-800/50">
                    <span className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">{et.name}</span>
                    <span className="text-body-caption font-bold text-zinc-950 dark:text-white bg-zinc-200/55 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">{et.count} bookings</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
