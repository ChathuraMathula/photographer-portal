"use client";

import { usePhotographerDashboard } from "./hooks/usePhotographerDashboard";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Dashboard sub-components
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const {
    firstName,
    role,
    isAuthenticated,
    handleLogout,
  } = usePhotographerDashboard();

  useEffect(() => {
    if (isAuthenticated && role === UserRole.PHOTOGRAPHER) {
      router.replace("/dashboard/reservations");
    }
  }, [isAuthenticated, role, router]);

  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <AdminDashboard
        firstName={firstName ?? ""}
        role={role}
        activeTab="overview"
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="animate-pulse text-zinc-500 font-medium">Redirecting...</div>
    </div>
  );
}
