"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueAreaChart, BookingStatusDonut, PackagePerformanceBar } from "@/app/dashboard/reports/charts";
import { KpiCardsGrid } from "@/app/dashboard/reports/components/KpiCardsGrid";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users, Download, ArrowUpRight, BarChart3, ShieldAlert } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type SystemStats = {
  totalPhotographers: number;
  totalAdmins: number;
  totalSuspended: number;
};

type LeaderboardRow = {
  id: string;
  name: string;
  email: string;
  bookingsCount: number;
  revenueLkr: number;
};

type AdminReportData = {
  period: string;
  startDateStr: string;
  endDateStr: string;
  summary: {
    totalBookings: number;
    potentialRevenueLkr: number;
    paidRevenueLkr: number;
    pendingRevenueLkr: number;
    conversionRate: number;
  };
  statusDistribution: Array<{ name: string; value: number }>;
  eventTypes: Array<{ name: string; count: number }>;
  packages: Array<{ name: string; count: number; revenueLkr: number }>;
  timeline: Array<{ label: string; bookings: number; revenueLkr: number }>;
  photographerLeaderboard: LeaderboardRow[];
  systemStats: SystemStats;
};

export function AdminReportsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [reportData, setReportData] = useState<AdminReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFinancial, setDownloadingFinancial] = useState(false);
  const [downloadingBookings, setDownloadingBookings] = useState(false);

  const fetchStats = async (showMainSpinner: boolean) => {
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
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin report data");
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

  useEffect(() => {
    if (period === "custom" && (!startDate || !endDate)) return;
    fetchStats(reportData === null);
  }, [period, startDate, endDate]);

  const handleDownloadFinancial = async () => {
    setDownloadingFinancial(true);
    try {
      let url = `${API}/reports/pdf/financial?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to download financial report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `system_financial_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Financial report PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report PDF");
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
      if (!response.ok) throw new Error("Failed to download bookings report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `system_bookings_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Bookings report PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report PDF");
    } finally {
      setDownloadingBookings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-zinc-400" /> System Reports &amp; Analytics
          </h1>
          <p className="text-body-small text-zinc-500">
            View aggregated platform performance, revenue distributions, and photographer leaderboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {(["weekly", "monthly", "yearly", "custom"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  period === p
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 px-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950"
              />
              <span className="text-xs text-zinc-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 px-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-950"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={downloadingFinancial}
              onClick={handleDownloadFinancial}
              className="h-9 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {downloadingFinancial ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Financial PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={downloadingBookings}
              onClick={handleDownloadBookings}
              className="h-9 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {downloadingBookings ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Bookings PDF
            </Button>
          </div>
        </div>
      </div>

      {/* System Statistics Overview */}
      {reportData?.systemStats && (
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Photographers</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
                {reportData.systemStats.totalPhotographers} Photographers
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Platform service providers</p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Admins</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
                {reportData.systemStats.totalAdmins} Agency Admins
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Managing user registrations</p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Suspended Accounts</CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-title-medium font-bold text-red-650 dark:text-red-400">
                {reportData.systemStats.totalSuspended} Accounts
              </div>
              <p className="text-[10px] text-red-500/80 mt-1">Access revoked by super admins</p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Main KPI grids */}
      {reportData && <KpiCardsGrid summary={reportData.summary} />}

      {/* Charts section */}
      {reportData && (
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Platform Revenue Trend</CardTitle>
              <CardDescription className="text-xs">Timeline representation of cash logs &amp; card payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueAreaChart data={reportData.timeline} />
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Reservation Status</CardTitle>
              <CardDescription className="text-xs">Platform booking states conversion breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <BookingStatusDonut data={reportData.statusDistribution} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Leaderboard Section */}
      {reportData?.photographerLeaderboard && reportData.photographerLeaderboard.length > 0 && (
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
            <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" /> Photographer Performance Leaderboard
            </CardTitle>
            <CardDescription className="text-xs">Top performing photographers sorted by total settled volume.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-small">
                <thead>
                  <tr className="border-b border-zinc-150 bg-zinc-55/10 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-body-small-s font-semibold">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Photographer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Settled Bookings</th>
                    <th className="p-4 text-right">Settled Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {reportData.photographerLeaderboard.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                      <td className="p-4 font-bold text-zinc-400">#{idx + 1}</td>
                      <td className="p-4 font-semibold text-zinc-900 dark:text-white">{row.name}</td>
                      <td className="p-4 text-zinc-555 dark:text-zinc-405">{row.email}</td>
                      <td className="p-4 text-center font-medium">{row.bookingsCount}</td>
                      <td className="p-4 text-right font-bold text-emerald-700 dark:text-emerald-450">
                        LKR {row.revenueLkr.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package performance and event types */}
      {reportData && (
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Popular Packages</CardTitle>
              <CardDescription className="text-xs">Aggregated package usage across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <PackagePerformanceBar data={reportData.packages} />
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Platform Event Types</CardTitle>
              <CardDescription className="text-xs">Breakdown of event types booked by customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                {reportData.eventTypes.length === 0 ? (
                  <p className="text-body-caption text-zinc-450 italic">No event types recorded</p>
                ) : (
                  reportData.eventTypes.map((et, i) => (
                    <div key={i} className="flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-150/40 dark:border-zinc-800/50">
                      <span className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">{et.name}</span>
                      <span className="text-body-caption font-bold text-zinc-950 dark:text-white bg-zinc-200/55 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                        {et.count} bookings
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
