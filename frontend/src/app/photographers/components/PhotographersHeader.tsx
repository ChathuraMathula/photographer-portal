"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  Camera,
  User,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Search,
} from "lucide-react";

interface PhotographersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function PhotographersHeader({
  searchTerm,
  onSearchChange,
}: PhotographersHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0e2d5c] to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
              Photographer<span className="text-blue-600 dark:text-blue-400">Portal</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Explore & Book</span>
          </div>
        </Link>

        {/* Quick Search Input */}
        <div className="flex-1 max-w-md hidden sm:block relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, location, or bio..."
            className="w-full h-10 pl-9 pr-4 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 focus:outline-none focus:ring-2 focus:ring-[#0e2d5c] dark:focus:ring-blue-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Right Actions / Sign In Menu */}
        <div className="relative">
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href={
                  auth.role === "CUSTOMER"
                    ? "/customer/dashboard"
                    : "/dashboard"
                }
                className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#0e2d5c] hover:bg-[#0b244a] text-white text-xs font-bold transition-all shadow-xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 h-10 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/80 transition-colors"
              >
                <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  {auth.firstName?.charAt(0) || auth.email?.charAt(0) || "U"}
                </span>
                <span className="max-w-[100px] truncate">
                  {auth.firstName || "Account"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#0e2d5c] hover:bg-[#0b244a] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>Sign In</span>
              <ChevronDown className="h-3.5 w-3.5 text-blue-200" />
            </button>
          )}

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {auth.isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-b border-zinc-150 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {auth.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      {auth.role}
                    </span>
                  </div>

                  <Link
                    href={
                      auth.role === "CUSTOMER"
                        ? "/customer/dashboard"
                        : "/dashboard"
                    }
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left border-t border-zinc-150 dark:border-zinc-800 mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Select Login Portal
                  </div>

                  <Link
                    href="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    Customer Login
                  </Link>

                  <Link
                    href="/photographer/login"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  >
                    <Camera className="h-4 w-4 text-indigo-600" />
                    Photographer Login
                  </Link>

                  <Link
                    href="/admin/login"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors border-t border-zinc-100 dark:border-zinc-800 mt-1"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
