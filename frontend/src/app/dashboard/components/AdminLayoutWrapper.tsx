"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { logout, UserRole } from "@/store/slices/authSlice";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
import {
  ClipboardList,
  LayoutDashboard,
  Users,
  BarChart3,
  UserCog,
} from "lucide-react";

export function AdminLayoutWrapper({
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

  let activeTab = "dashboard";
  if (pathname.startsWith("/dashboard/users")) {
    activeTab = "users";
  } else if (pathname.startsWith("/dashboard/reports")) {
    activeTab = "reports";
  } else if (pathname.startsWith("/dashboard/profile")) {
    activeTab = "profile";
  } else if (pathname.startsWith("/dashboard/settings")) {
    activeTab = "settings";
  } else if (pathname.startsWith("/dashboard/audit-logs")) {
    activeTab = "audit-logs";
  } else {
    activeTab = pathname.split("/").filter(Boolean).pop() || "dashboard";
  }

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "reports") router.push("/dashboard/reports");
    else if (tab === "profile") router.push("/dashboard/profile");
    else if (tab === "settings") router.push("/dashboard/settings");
    else if (tab === "audit-logs") router.push("/dashboard/audit-logs");
    else router.push("/dashboard/users");
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
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile Details", icon: UserCog },
  ];

  if (role === UserRole.SUPER_ADMIN) {
    menuItems.push({
      id: "audit-logs",
      label: "Audit Logs",
      icon: ClipboardList,
    });
  }

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
