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
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  if (!context) return null;
  const { authFetch } = context;

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await authFetch(`${API}/reports/data?period=${period}`);
        if (!res.ok) throw new Error("Failed to fetch report data");
        const json = await res.json();
        setReportData(json);
      } catch (err) {
        console.error(err);
        toast.error("Could not load reports and analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [period, authFetch]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API}/reports/pdf?period=${period}`);
      if (response.status === 401) {
        toast.error("You are unauthorized. Please log in again.");
        return;
      }
      if (!response.ok) throw new Error("PDF generation failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photographer_analytics_${period}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF report. Try again later.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePeriodChange = (newPeriod: "weekly" | "monthly" | "yearly") => {
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header period selector and download button */}
      <ReportsHeader
        period={period}
        onPeriodChange={handlePeriodChange}
        downloading={downloading}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* KPI Cards Grid */}
      <KpiCardsGrid summary={summary} />

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Timeline Area Chart */}
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900 p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">Revenue Timeline</CardTitle>
            <CardDescription className="text-xs">Cumulative paid deposits over time.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <RevenueAreaChart data={timeline} />
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900 p-4">
          <CardHeader className="p-0 pb-4">
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
          <CardHeader className="p-0 pb-4">
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
  );
}

