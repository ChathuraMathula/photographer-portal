"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueAreaChart, BookingStatusDonut, PackagePerformanceBar } from "./charts";
import { ReportsHeader } from "./components/ReportsHeader";
import { KpiCardsGrid } from "./components/KpiCardsGrid";
import { BusinessAdvisoryCard } from "./components/BusinessAdvisoryCard";
import { BookingsLogTable } from "./components/BookingsLogTable";
import { AdminReportsPage } from "@/components/dashboard/reports/AdminReportsPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ADMIN_MENU } from "@/components/dashboard/AdminDashboard";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
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
  const dispatch = useDispatch();
  const router = useRouter();
  const { start } = useTopLoadingBar();
  const { role, firstName } = useSelector((state: RootState) => state.auth);

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

  const handleLogout = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout error:", err);
    }
    dispatch(logout());
    window.location.href = "/login";
  };

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "overview") router.push("/dashboard");
    else if (tab === "reports") router.push("/dashboard/reports");
    else if (tab === "profile") router.push("/dashboard/profile");
    else router.push("/dashboard/users");
  };

  const loadStats = async (showMainSpinner: boolean) => {
    if (!context) return;
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
      const res = await context.authFetch(url, { credentials: "include" });
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

  useEffect(() => {
    if (role === UserRole.PHOTOGRAPHER) {
      if (period === "custom" && (!startDate || !endDate)) return;
      loadStats(reportData === null);
    }
  }, [period, startDate, endDate, context, role]);

  // If Admin or Super Admin, render Admin reports wrapped in DashboardLayout
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <DashboardLayout
        activeTab="reports"
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userName={firstName ?? ""}
        userRole={role ?? ""}
        menuItems={ADMIN_MENU}
      >
        <AdminReportsPage />
      </DashboardLayout>
    );
  }

  // Fallback for Photographer role
  if (!context) return null;
  const { authFetch } = context;

  const handleDownloadFinancial = async () => {
    setDownloadingFinancial(true);
    try {
      let url = `${API}/reports/pdf/financial?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await authFetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to download PDF report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `financial_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
      const response = await authFetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to download PDF report");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `bookings_report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
                <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white font-bold">Revenue Timeline</CardTitle>
                <CardDescription className="text-xs">Your financial timeline representation</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueAreaChart data={reportData.timeline} />
              </CardContent>
            </Card>

            <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white font-bold">Booking Status</CardTitle>
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
                <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white font-bold">Popular Packages</CardTitle>
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
