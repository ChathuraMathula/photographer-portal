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
    <div className="space-y-6 animate-in fade-in duration-300">
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
