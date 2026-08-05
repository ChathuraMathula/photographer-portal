"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { logout, UserRole } from "@/store/slices/authSlice";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
import {
  Building2,
  CalendarDays,
  Camera,
  LayoutDashboard,
  Package,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

export function StudioLayoutWrapper({
  children,
  firstName,
  role,
}: {
  children: React.ReactNode;
  firstName: string;
  role: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { start } = useTopLoadingBar();

  const activeTab = pathname.split("/").pop() as any;

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "reservations") router.push("/dashboard/reservations");
    else if (tab === "calendar") router.push("/dashboard/calendar");
    else if (tab === "photographers") router.push("/dashboard/photographers");
    else if (tab === "packages") router.push("/dashboard/packages");
    else if (tab === "profile") router.push("/dashboard/profile");
    else if (tab === "settings") router.push("/dashboard/settings");
    else router.push("/dashboard");
  };

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
    window.location.href = "/portal/login";
  };

  const menuItems = [
    { id: "dashboard", label: "Studio Overview", icon: LayoutDashboard },
    { id: "reservations", label: "Reservations", icon: CalendarDays },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "photographers", label: "Team", icon: Users },
    { id: "packages", label: "Packages", icon: Package },
    { id: "profile", label: "Studio Profile", icon: UserCog },
  ];

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      userName={firstName}
      userRole={role}
      menuItems={menuItems}
    >
      {children}
    </DashboardLayout>
  );
}
