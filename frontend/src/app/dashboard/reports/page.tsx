"use client";

import React, { useState, useEffect, startTransition } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingUp, Percent, FileDown, ArrowUpDown } from "lucide-react";
import { RevenueAreaChart, BookingStatusDonut, PackagePerformanceBar } from "./charts";
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
      const response = await fetch(`${API}/reports/pdf?period=${period}`, {
        method: "GET",
        headers: {
          // Send auth token cookie implicitly or manually if needed, standard credentials include:
        },
      });
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
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-body-caption text-zinc-500 mt-1">
            Analyze revenue margins, booking trends, package popularity, and event distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
            {(["weekly", "monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-1.5 rounded-lg text-body-caption font-semibold transition-all cursor-pointer ${
                  period === p
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-body-caption font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {downloading ? "Generating..." : "PDF Report"}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Potential Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
              LKR {summary.potentialRevenueLkr.toLocaleString()}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Total contract values in range</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Paid Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
              LKR {summary.paidRevenueLkr.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-1">
              LKR {summary.pendingRevenueLkr.toLocaleString()} Pending
            </p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
              {summary.totalBookings}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Reservations submitted</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Conversion Ratio</CardTitle>
            <Percent className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
              {summary.conversionRate}%
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Confirmed/Completed ratio</p>
          </CardContent>
        </Card>
      </div>

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
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-zinc-950 text-white p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Business Advisory</span>
            <h3 className="text-body-base-bold font-bold mt-1 text-white">Recommended Decisions</h3>
            <p className="text-xs text-zinc-350 leading-relaxed mt-4">
              {summary.conversionRate < 50
                ? "Your booking conversion rate is under 50%. Clients are requesting reservations, but a high percentage are not reaching Confirmed. We suggest following up quicker on proposed quotation emails and reviewing if your deposit values are too high."
                : summary.totalBookings > 10
                ? "Your business conversion and traction are excellent! You should consider raising prices for your highest-ranking event packages or offering customized premium upgrades during the quotation process."
                : "Your reservation patterns are stable. Keep client communication channels active and ensure your packages page is fully updated with current service descriptions to attract more leads."}
            </p>
          </div>
          <div className="border-t border-zinc-800 pt-4 mt-6 flex items-center gap-3">
            <ArrowUpDown className="h-5 w-5 text-blue-500" />
            <div className="text-[11px] text-zinc-400">
              Generated automatically based on range conversion indicators
            </div>
          </div>
        </Card>
      </div>

      {/* Bookings log table in range */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">Range Bookings Log</CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            A comprehensive list of all reservations scheduled in the filtered time window.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rawBookings.length === 0 ? (
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
                  {rawBookings.map((res) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
