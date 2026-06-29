"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
import { useReports } from "./hooks/useReports";
import { PhotographerReportsView } from "@/components/dashboard/reports/PhotographerReportsView";
import { AdminReportsPage } from "@/components/dashboard/reports/AdminReportsPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ADMIN_MENU } from "@/components/dashboard/AdminDashboard";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";

export default function ReportsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { start } = useTopLoadingBar();
  const { role, firstName } = useSelector((state: RootState) => state.auth);

  // Photographer custom reports hook
  const reportsHook = useReports();

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
      handleDownloadFinancial={reportsHook.handleDownloadFinancial}
      handleDownloadBookings={reportsHook.handleDownloadBookings}
      handleDownloadLocation={reportsHook.handleDownloadLocation}
    />
  );
}
