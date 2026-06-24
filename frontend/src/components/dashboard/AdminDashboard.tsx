"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout, type MenuItem } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users } from "lucide-react";

import { useTopLoadingBar } from "@/context/TopLoadingBarContext";

// ── Admin nav items ───────────────────────────────────────────────────────────

export const ADMIN_MENU: MenuItem[] = [
  { id: "overview", label: "Overview",         icon: LayoutDashboard },
  { id: "users",    label: "User Management",  icon: Users },
];

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  firstName: string;
  role: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

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
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={onLogout}
      userName={firstName}
      userRole={role}
      menuItems={ADMIN_MENU}
    >
      <div className="space-y-8">
        {/* Welcome header */}
        <div>
          <h1 className="text-title-large text-primary-dark">Admin Portal</h1>
          <p className="text-body-small text-zinc-500 mt-1">
            Welcome back,{" "}
            <span className="font-semibold text-zinc-800">{firstName}</span>
            {" · "}
            <span className="font-semibold text-zinc-600">{role}</span>
          </p>
        </div>

        {/* Status cards */}
        <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <Card className="border border-zinc-200/50 shadow-sm rounded-xl">
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

          <Card className="border border-zinc-200/50 shadow-sm rounded-xl">
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
                className="text-title-medium text-primary-light hover:text-primary-dark hover:underline block"
              >
                Go to Maildev
              </a>
              <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
                Check outgoing bookings emails locally
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 shadow-sm rounded-xl">
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
                className="text-title-medium text-primary-light hover:text-primary-dark hover:underline block"
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
        <Card className="border border-zinc-200/50 p-8 text-center bg-white shadow-sm rounded-xl">
          <h2 className="text-title-medium text-primary-dark mb-2">
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
    </DashboardLayout>
  );
}
