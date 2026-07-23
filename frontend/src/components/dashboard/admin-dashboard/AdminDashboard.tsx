"use client";

import { useRouter } from "next/navigation";
import { type MenuItem } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, BarChart3, UserCog } from "lucide-react";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
import { AdminHeader } from "./components/AdminHeader";
import { SystemStatusCards } from "./components/SystemStatusCards";
import { AdminCTASection } from "./components/AdminCTASection";

export const ADMIN_MENU: MenuItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  { id: "profile", label: "Profile Settings", icon: UserCog },
];

type Props = {
  firstName: string;
  role: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout: () => void;
};

export function AdminDashboard({ firstName, role, onTabChange }: Props) {
  const router = useRouter();
  const { start } = useTopLoadingBar();

  const handleTabChange = (tab: string) => {
    start();
    if (onTabChange) {
      onTabChange(tab);
    }
    if (tab === "users") {
      router.push("/dashboard/users");
    } else if (tab === "reports") {
      router.push("/dashboard/reports");
    } else if (tab === "profile") {
      router.push("/dashboard/profile");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <AdminHeader firstName={firstName} role={role} />
      <SystemStatusCards />
      <AdminCTASection onUsersClick={() => handleTabChange("users")} />
    </div>
  );
}
