"use client";

import { usePhotographerDashboard } from "./hooks/usePhotographerDashboard";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard/AdminDashboard";
import { StudioOverview } from "@/components/dashboard/studio-overview/StudioOverview";

export default function DashboardPage() {
  const router = useRouter();
  const { firstName, role, isAuthenticated, handleLogout } =
    usePhotographerDashboard();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role === UserRole.PHOTOGRAPHER) {
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

  if (
    role === UserRole.STUDIO ||
    (role as string) === "STUDIO_PHOTOGRAPHER" ||
    (role as string) === "STUDIO_STAFF"
  ) {
    return <StudioOverview />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="animate-pulse text-zinc-500 font-medium">
        Redirecting...
      </div>
    </div>
  );
}
