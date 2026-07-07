"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCardsGrid } from "@/app/dashboard/reports/components/KpiCardsGrid";
import { LocationAnalyticsSection } from "./location/LocationAnalyticsSection";
import { BookingsLogTable } from "@/app/dashboard/reports/components/BookingsLogTable";
import { useAdminReportsData } from "./hooks/useAdminReportsData";
import { AdminReportsHeader } from "./components/AdminReportsHeader";
import { AdminSystemStats } from "./components/AdminSystemStats";
import { AdminReportsCharts } from "./components/AdminReportsCharts";
import { AdminLeaderboard } from "./components/AdminLeaderboard";

export function AdminReportsPage() {
  const { period, setPeriod, startDate, setStartDate, endDate, setEndDate, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, reportData, loading, refreshing, downloadingFinancial, downloadingBookings, downloadingLocation, handleDownloadFinancial, handleDownloadBookings, handleDownloadLocation, bookingsData, bookingsPage, setBookingsPage, bookingsLoading, leaderboardData, leaderboardPage, setLeaderboardPage, leaderboardSearch, setLeaderboardSearch, leaderboardLoading } = useAdminReportsData();

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <AdminReportsHeader period={period} setPeriod={setPeriod} selectedYear={selectedYear} setSelectedYear={setSelectedYear} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} downloadingFinancial={downloadingFinancial} handleDownloadFinancial={handleDownloadFinancial} downloadingBookings={downloadingBookings} handleDownloadBookings={handleDownloadBookings} downloadingLocation={downloadingLocation} handleDownloadLocation={handleDownloadLocation} />
      {reportData?.systemStats && <AdminSystemStats stats={reportData.systemStats} />}
      {reportData && <KpiCardsGrid summary={reportData.summary} />}
      <AdminReportsCharts reportData={reportData} loading={loading} refreshing={refreshing} />
      <AdminLeaderboard data={leaderboardData} loading={leaderboardLoading} page={leaderboardPage} setPage={setLeaderboardPage} search={leaderboardSearch} setSearch={setLeaderboardSearch} />
      {reportData && (
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <LocationAnalyticsSection rawBookings={reportData.locationData as any} title="System-wide Booking Location Analytics" description="Platform-wide geographic insights across all photographers — district breakdowns, city rankings, event type distribution, and exact coordinate mapping." />
          </CardContent>
        </Card>
      )}
      <BookingsLogTable bookingsData={bookingsData} bookingsPage={bookingsPage} setBookingsPage={setBookingsPage} bookingsLoading={bookingsLoading} />
    </div>
  );
}
