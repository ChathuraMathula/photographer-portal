"use client";

import React from "react";
import { ReportsHeader } from "@/app/dashboard/reports/components/ReportsHeader";
import { KpiCardsGrid } from "@/app/dashboard/reports/components/KpiCardsGrid";
import { BusinessAdvisoryCard } from "@/app/dashboard/reports/components/BusinessAdvisoryCard";
import { PhotographerAnalyticsCharts } from "@/app/dashboard/reports/components/PhotographerAnalyticsCharts";
import { PhotographerPerformanceBreakdown } from "@/app/dashboard/reports/components/PhotographerPerformanceBreakdown";
import { Loader2 } from "lucide-react";
import { type ReportData } from "@/app/dashboard/reports/hooks/useReports";
import { LocationAnalyticsSection } from "./location/LocationAnalyticsSection";

type Props = {
  period: "weekly" | "monthly" | "yearly" | "custom";
  setPeriod: (p: "weekly" | "monthly" | "yearly" | "custom") => void;
  startDate: string;
  setStartDate: (s: string) => void;
  endDate: string;
  setEndDate: (e: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  reportData: ReportData | null;
  loading: boolean;
  refreshing: boolean;
  downloadingFinancial: boolean;
  downloadingBookings: boolean;
  downloadingLocation?: boolean;
  loadStats: (showSpinner: boolean) => void;
  handleDownloadFinancial: () => void;
  handleDownloadBookings: () => void;
  handleDownloadLocation?: () => void;
};

export function PhotographerReportsView({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  reportData,
  loading,
  refreshing,
  downloadingFinancial,
  downloadingBookings,
  downloadingLocation = false,
  loadStats,
  handleDownloadFinancial,
  handleDownloadBookings,
  handleDownloadLocation,
}: Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ReportsHeader
        period={period}
        startDate={startDate}
        endDate={endDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onPeriodChange={setPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onDownloadFinancial={handleDownloadFinancial}
        onDownloadBookings={handleDownloadBookings}
        onDownloadLocation={handleDownloadLocation}
        downloadingFinancial={downloadingFinancial}
        downloadingBookings={downloadingBookings}
        downloadingLocation={downloadingLocation}
      />

      {loading ? (
        <div className="space-y-6 animate-pulse mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50" />
            ))}
          </div>
          <div className="h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50" />
            <div className="h-96 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50" />
          </div>
          <div className="h-[450px] bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50" />
        </div>
      ) : reportData ? (
        <>
          {/* KPI Summary Cards */}
          <KpiCardsGrid summary={reportData.summary} />

          {/* Business Advisory Widget */}
          <BusinessAdvisoryCard
            conversionRate={reportData.summary.conversionRate}
            totalBookings={reportData.summary.totalBookings}
          />

          {/* Charts Section */}
          <PhotographerAnalyticsCharts
            timeline={reportData.timeline}
            statusDistribution={reportData.statusDistribution}
          />

          {/* Location Analytics Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-6 shadow-sm">
            <LocationAnalyticsSection rawBookings={reportData.rawBookings as any} />
          </div>

          {/* Performance Lists Section */}
          <PhotographerPerformanceBreakdown
            packages={reportData.packages}
            rawBookings={reportData.rawBookings}
          />
        </>
      ) : (
        <div className="text-center py-12 text-zinc-500">No report data loaded.</div>
      )}
    </div>
  );
}
