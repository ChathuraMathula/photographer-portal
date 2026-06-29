"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueAreaChart, BookingStatusDonut, PackagePerformanceBar } from "@/app/dashboard/reports/charts";
import { ReportsHeader } from "@/app/dashboard/reports/components/ReportsHeader";
import { KpiCardsGrid } from "@/app/dashboard/reports/components/KpiCardsGrid";
import { BusinessAdvisoryCard } from "@/app/dashboard/reports/components/BusinessAdvisoryCard";
import { BookingsLogTable } from "@/app/dashboard/reports/components/BookingsLogTable";
import { Loader2 } from "lucide-react";
import { type ReportData } from "@/app/dashboard/reports/hooks/useReports";

type Props = {
  period: "weekly" | "monthly" | "yearly" | "custom";
  setPeriod: (p: "weekly" | "monthly" | "yearly" | "custom") => void;
  startDate: string;
  setStartDate: (s: string) => void;
  endDate: string;
  setEndDate: (e: string) => void;
  reportData: ReportData | null;
  loading: boolean;
  refreshing: boolean;
  downloadingFinancial: boolean;
  downloadingBookings: boolean;
  loadStats: (showSpinner: boolean) => void;
  handleDownloadFinancial: () => void;
  handleDownloadBookings: () => void;
};

export function PhotographerReportsView({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  reportData,
  loading,
  refreshing,
  downloadingFinancial,
  downloadingBookings,
  loadStats,
  handleDownloadFinancial,
  handleDownloadBookings,
}: Props) {
  return (
    <div className="space-y-6">
      <ReportsHeader
        period={period}
        startDate={startDate}
        endDate={endDate}
        onPeriodChange={setPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onDownloadFinancial={handleDownloadFinancial}
        onDownloadBookings={handleDownloadBookings}
        downloadingFinancial={downloadingFinancial}
        downloadingBookings={downloadingBookings}
        refreshing={refreshing}
        onRefresh={() => loadStats(false)}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      ) : reportData ? (
        <>
          {/* KPI Summary Cards */}
          <KpiCardsGrid summary={reportData.summary} />

          {/* Business Advisory Widget */}
          <BusinessAdvisoryCard summary={reportData.summary} />

          {/* Charts section */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Revenue Timeline</CardTitle>
                <CardDescription className="text-xs">Your financial timeline representation</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueAreaChart data={reportData.timeline} />
              </CardContent>
            </Card>

            <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Booking Status</CardTitle>
                <CardDescription className="text-xs">Current reservation statuses conversion</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <BookingStatusDonut data={reportData.statusDistribution} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Package Performance */}
            <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Popular Packages</CardTitle>
                <CardDescription className="text-xs">Your packages ranked by earnings and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <PackagePerformanceBar data={reportData.packages} />
              </CardContent>
            </Card>

            {/* Bookings log table */}
            <BookingsLogTable bookings={reportData.rawBookings} />
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-zinc-500">No report data loaded.</div>
      )}
    </div>
  );
}
