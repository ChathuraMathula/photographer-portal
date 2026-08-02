"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { CUSTOMER_MENU } from "@/components/dashboard/layout/constants";
import {
  CalendarCheck,
  CalendarDays,
  User,
  Settings,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const activeTab = pathname.split("/").pop() || "dashboard";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = mounted
    ? (auth.firstName || auth.email?.split("@")[0] || "Customer")
    : "Customer";

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") router.push("/customer/dashboard");
    else if (tab === "calendar") router.push("/customer/calendar");
    else if (tab === "profile") router.push("/customer/profile");
    else if (tab === "settings") router.push("/customer/settings");
    else router.push(`/customer/${tab}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handlePlusClick = () => {
    toast.info("Book a Photographer: Photographer selection page coming soon!");
  };

  // If on complete-profile page, render cleanly without full dashboard layout
  if (pathname.includes("/complete-profile")) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userName={userName}
        userRole="CUSTOMER"
        menuItems={CUSTOMER_MENU}
      >
        <div className="pb-16 sm:pb-0">{children}</div>
      </DashboardLayout>

      {/* Sticky Bottom Menu (Mobile Only) */}
      <nav className="block sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Bookings Link */}
          <Link
            href="/customer/dashboard"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              pathname.includes("/customer/dashboard") || pathname.includes("/customer/reservations")
                ? "text-[#0e2d5c] dark:text-blue-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            <CalendarCheck className="h-5 w-5" />
            <span>Bookings</span>
          </Link>

          {/* Calendar Link */}
          <Link
            href="/customer/calendar"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              pathname.includes("/customer/calendar")
                ? "text-[#0e2d5c] dark:text-blue-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            <CalendarDays className="h-5 w-5" />
            <span>Calendar</span>
          </Link>

          {/* Central Floating Rounded Plus Button */}
          <div className="relative -mt-6">
            <button
              type="button"
              onClick={handlePlusClick}
              className="h-12 w-12 rounded-full bg-[#0e2d5c] text-white shadow-lg flex items-center justify-center border-4 border-white dark:border-zinc-950 active:scale-95 transition-all cursor-pointer"
              title="Book Photographer"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Profile Link */}
          <Link
            href="/customer/profile"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              pathname.includes("/customer/profile")
                ? "text-[#0e2d5c] dark:text-blue-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
