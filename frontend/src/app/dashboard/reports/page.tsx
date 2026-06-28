"use client";

import React, { useState, useEffect, startTransition } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueAreaChart, BookingStatusDonut, PackagePerformanceBar } from "./charts";
import { ReportsHeader } from "./components/ReportsHeader";
import { KpiCardsGrid } from "./components/KpiCardsGrid";
import { BusinessAdvisoryCard } from "./components/BusinessAdvisoryCard";
import { BookingsLogTable } from "./components/BookingsLogTable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type ReportSummary = {
  totalBookings: number;
  potentialRevenueLkr: number;
  paidRevenueLkr: number;
  pendingRevenueLkr: number;
  conversionRate: number;
};

type ReportData = {
  period: string;
  startDateStr: string;
  endDateStr: string;
  summary: ReportSummary;
  statusDistribution: Array<{ name: string; value: number }>;
  eventTypes: Array<{ name: string; count: number }>;
  packages: Array<{ name: string; count: number; revenueLkr: number }>;
  timeline: Array<{ label: string; bookings: number; revenueLkr: number }>;
  rawBookings: Array<{
    id: string;
    clientName: string;
    date: string;
    eventType: string;
    totalLkr: number;
    status: string;
  }>;
};

export default function ReportsPage() {
  const context = usePhotographerDashboardContext();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly");
  
  // Custom Date States
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFinancial, setDownloadingFinancial] = useState(false);
  const [downloadingBookings, setDownloadingBookings] = useState(false);

  if (!context) return null;
  const { authFetch } = context;

  const loadStats = async (showMainSpinner: boolean) => {
    if (showMainSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      let url = `${API}/reports/data?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await authFetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report data");
      const json = await res.json();
      setReportData(json);
    } catch (err) {
      console.error(err);
      toast.error("Could not load reports and analytics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch when period or custom date range changes
  useEffect(() => {
    // Only load stats if we have valid date values for custom ranges
    if (period === "custom" && (!startDate || !endDate)) return;
    loadStats(reportData === null);
  }, [period, startDate, endDate, authFetch]);

  const handleDownloadFinancial = async () => {
    setDownloadingFinancial(true);
    try {
      let url = `${API}/reports/pdf/financial?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (response.status === 401) {
        toast.error("You are unauthorized. Please log in again.");
        return;
      }
      if (!response.ok) throw new Error("Financial PDF generation failed");
      
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `photographer_financial_report_${period}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      toast.success("Financial PDF report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Financial PDF report.");
    } finally {
      setDownloadingFinancial(false);
    }
  };

  const handleDownloadBookings = async () => {
    setDownloadingBookings(true);
    try {
      let url = `${API}/reports/pdf/bookings?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (response.status === 401) {
        toast.error("You are unauthorized. Please log in again.");
        return;
      }
      if (!response.ok) throw new Error("Bookings PDF generation failed");
      
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `photographer_bookings_report_${period}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      toast.success("Bookings PDF report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Bookings PDF report.");
    } finally {
      setDownloadingBookings(false);
    }
  };

  const handlePeriodChange = (newPeriod: "weekly" | "monthly" | "yearly" | "custom") => {
    startTransition(() => {
      setPeriod(newPeriod);
    });
  };

  if (loading || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-dark"></div>
        <p className="text-zinc-500 font-medium text-body-small">Assembling analytics dashboard...</p>
      </div>
    );
  }

  const { summary, statusDistribution, packages, timeline, rawBookings } = reportData;

  return (
    <div className="space-y-6 relative">
      {/* Header period selector and download button */}
      <ReportsHeader
        period={period}
        onPeriodChange={handlePeriodChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        downloadingFinancial={downloadingFinancial}
        downloadingBookings={downloadingBookings}
        onDownloadFinancial={handleDownloadFinancial}
        onDownloadBookings={handleDownloadBookings}
      />

      {/* Smooth Opacity Refreshing Loader overlay to prevent UI jumps */}
      <div className={`space-y-6 transition-all duration-300 ${refreshing ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {/* KPI Cards Grid */}
        <KpiCardsGrid summary={summary} />

        {/* Main Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Timeline Area Chart */}
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900 p-4">
            <CardHeader className="p-0 pb-4 text-left">
              <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">Revenue Timeline</CardTitle>
              <CardDescription className="text-xs">Cumulative paid deposits over time.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <RevenueAreaChart data={timeline} />
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900 p-4">
            <CardHeader className="p-0 pb-4 text-left">
              <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">Booking Status distribution</CardTitle>
              <CardDescription className="text-xs">Visual breakdown of status types in this range.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex items-center justify-center">
              <BookingStatusDonut data={statusDistribution} />
            </CardContent>
          </Card>
        </div>

        {/* Package Performance & Business Advisory */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Packages Performance Bar Chart */}
          <Card className="lg:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900 p-4">
            <CardHeader className="p-0 pb-4 text-left">
              <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">Package Performance</CardTitle>
              <CardDescription className="text-xs">Packages ranked by total generated volume.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <PackagePerformanceBar data={packages} />
            </CardContent>
          </Card>

          {/* Business Advice Recommendation Box */}
          <BusinessAdvisoryCard
            conversionRate={summary.conversionRate}
            totalBookings={summary.totalBookings}
          />
        </div>

        {/* Bookings log table in range */}
        <BookingsLogTable rawBookings={rawBookings} />
      </div>

      {/* Floating loading spinner overlay when refreshing to prevent UI jump */}
      {refreshing && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none z-10 animate-in fade-in duration-200">
          <div className="bg-white/80 dark:bg-zinc-900/80 p-4 rounded-full shadow-lg border border-zinc-200/30 flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-500 animate-spin" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Refreshing calculations...</span>
          </div>
        </div>
      )}
    </div>
  );
}
