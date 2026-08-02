"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  LogOut,
  Plus,
  Home,
  FileText,
  Sparkles,
  Camera,
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

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handlePlusClick = () => {
    toast.info("Book a Photographer: Photographer selection page coming soon!");
  };

  // If on complete-profile page, render cleanly without full navigation
  if (pathname.includes("/complete-profile")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sticky Topbar Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#0e2d5c] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm">
            CP
          </div>
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-white block leading-none">
              Customer Portal
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Photographer Portal Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {auth.email}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="h-8 px-3 text-xs gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Body Area with Desktop Sidebar & Main View */}
      <div className="flex-1 flex pb-16 sm:pb-0">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex flex-col w-60 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 space-y-6 shrink-0 min-h-[calc(100vh-57px)]">
          <div className="space-y-1">
            <Link
              href="/customer/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                pathname === "/customer/dashboard"
                  ? "bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Calendar className="h-4 w-4" />
              My Bookings & Chats
            </Link>
          </div>

          {/* Info Card in Sidebar */}
          <div className="mt-auto p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Need a Booking?
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Contact your photographer directly or click the booking link provided by your photographer.
            </p>
          </div>
        </aside>

        {/* Main Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Sticky Bottom Menu (Mobile Only) */}
      <nav className="block sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-6 py-2">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Home / Bookings Link */}
          <Link
            href="/customer/dashboard"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              pathname === "/customer/dashboard"
                ? "text-[#0e2d5c] dark:text-blue-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Bookings</span>
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

          {/* Profile / Account Link */}
          <Link
            href="/customer/dashboard"
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
