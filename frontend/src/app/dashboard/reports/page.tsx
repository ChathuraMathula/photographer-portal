"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { useReports } from "./hooks/useReports";
import { PhotographerReportsView } from "@/components/dashboard/reports/PhotographerReportsView";
import { AdminReportsPage } from "@/components/dashboard/reports/AdminReportsPage";

export default function ReportsPage() {
  const { role } = useSelector((state: RootState) => state.auth);

  // Photographer custom reports hook
  const reportsHook = useReports();

  // Fetch data on mount/change if role is photographer
  useEffect(() => {
    if (role === UserRole.PHOTOGRAPHER && reportsHook.hasContext) {
      if (reportsHook.period === "custom" && (!reportsHook.startDate || !reportsHook.endDate)) return;
      reportsHook.loadStats(reportsHook.reportData === null);
    }
  }, [
    reportsHook.period,
    reportsHook.startDate,
    reportsHook.endDate,
    reportsHook.selectedYear,
    reportsHook.selectedMonth,
    reportsHook.hasContext,
    role
  ]);

  // If Admin or Super Admin, render Admin reports directly
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return <AdminReportsPage />;
  }

  // Fallback for Photographer role
  return (
    <PhotographerReportsView
      period={reportsHook.period}
      setPeriod={reportsHook.setPeriod}
      startDate={reportsHook.startDate}
      setStartDate={reportsHook.setStartDate}
      endDate={reportsHook.endDate}
      setEndDate={reportsHook.setEndDate}
      selectedYear={reportsHook.selectedYear}
      setSelectedYear={reportsHook.setSelectedYear}
      selectedMonth={reportsHook.selectedMonth}
      setSelectedMonth={reportsHook.setSelectedMonth}
      reportData={reportsHook.reportData}
      loading={reportsHook.loading}
      refreshing={reportsHook.refreshing}
      downloadingFinancial={reportsHook.downloadingFinancial}
      downloadingBookings={reportsHook.downloadingBookings}
      downloadingLocation={reportsHook.downloadingLocation}
      loadStats={reportsHook.loadStats}
      bookingsData={reportsHook.bookingsData}
      bookingsPage={reportsHook.bookingsPage}
      setBookingsPage={reportsHook.setBookingsPage}
      bookingsLoading={reportsHook.bookingsLoading}
      handleDownloadFinancial={reportsHook.handleDownloadFinancial}
      handleDownloadBookings={reportsHook.handleDownloadBookings}
      handleDownloadLocation={reportsHook.handleDownloadLocation}
    />
  );
}
