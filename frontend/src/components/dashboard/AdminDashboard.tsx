"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type MenuItem } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, BarChart3, UserCog } from "lucide-react";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";

// ── Admin nav items ───────────────────────────────────────────────────────────

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

export function AdminDashboard({
  firstName,
  role,
  activeTab = "overview",
  onTabChange,
  onLogout,
}: Props) {
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
      {/* Welcome header */}
      <div>
        <h1 className="text-title-large text-primary-dark dark:text-white">Admin Portal</h1>
        <p className="text-body-small text-zinc-500 mt-1">
          Welcome back,{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{firstName}</span>
          {" · "}
          <span className="font-semibold text-zinc-600 dark:text-zinc-400">{role}</span>
        </p>
      </div>

      {/* Status cards */}
      <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-body-small-s font-semibold text-zinc-500">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-title-medium text-emerald-600">Active &amp; Sync</p>
            <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
              PostgreSQL DB connected successfully
            </p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-body-small-s font-semibold text-zinc-500">
              Local Maildev
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="http://localhost:1080"
              target="_blank"
              rel="noreferrer"
              className="text-title-medium text-blue-600 dark:text-blue-400 hover:underline block font-semibold"
            >
              Go to Maildev
            </a>
            <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
              Check outgoing bookings emails locally
            </p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-body-small-s font-semibold text-zinc-500">
              Local pgAdmin ERD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="http://localhost:5050"
              target="_blank"
              rel="noreferrer"
              className="text-title-medium text-blue-600 dark:text-blue-400 hover:underline block font-semibold"
            >
              pgAdmin Web UI
            </a>
            <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
              Visual diagram on port 5050
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA card */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 p-8 text-center bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <h2 className="text-title-medium text-primary-dark dark:text-white mb-2">
          Create &amp; Manage User Accounts
        </h2>
        <p className="text-body-small text-zinc-500 mb-6 max-w-lg mx-auto leading-relaxed">
          You have access to create system users. Super Admins can add Admins
          and Photographers. Admins can create Photographers only.
        </p>
        <Button
          onClick={() => handleTabChange("users")}
          className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-8 shadow-sm"
        >
          Open User Management
        </Button>
      </Card>
    </div>
  );
}
