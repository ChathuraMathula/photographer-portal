"use client";

import React from "react";
import { Search, X, Sparkles, Filter, Users, CheckCircle2, Clock, Ban } from "lucide-react";
import { UserRole } from "@/store/slices/authSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UserFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  loggedInRole: UserRole | string | null;
  unreadCount?: number;
}

export function UserFiltersBar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  loggedInRole,
  unreadCount = 0,
}: UserFiltersBarProps) {
  const isFiltered = search || roleFilter !== "ALL" || statusFilter !== "ALL";

  const handleResetFilters = () => {
    onSearchChange("");
    onRoleFilterChange("ALL");
    onStatusFilterChange("ALL");
  };

  return (
    <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm">
      {/* Top Bar: Search + Dropdowns */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, studio, or username..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-9 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[150px] h-10 text-xs font-semibold rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="PHOTOGRAPHER">Photographers</SelectItem>
              <SelectItem value="STUDIO">Studios</SelectItem>
              {loggedInRole === UserRole.SUPER_ADMIN && (
                <>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[160px] h-10 text-xs font-semibold rounded-xl bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="active">Active Accounts</SelectItem>
              <SelectItem value="inactive">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 px-3 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white rounded-xl"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Quick Status Tabs Bar */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
          <Filter className="h-3 w-3" /> Quick Filter:
        </span>

        <button
          type="button"
          onClick={() => onStatusFilterChange("ALL")}
          className={`h-7 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <Users className="h-3 w-3" />
          All Users
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("pending")}
          className={`h-7 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 hover:bg-amber-100"
          }`}
        >
          <Clock className="h-3 w-3" />
          Pending Submissions
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">
              {unreadCount} NEW
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("active")}
          className={`h-7 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            statusFilter === "active"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          Active Accounts
        </button>

        <button
          type="button"
          onClick={() => onStatusFilterChange("inactive")}
          className={`h-7 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            statusFilter === "inactive"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100"
          }`}
        >
          <Ban className="h-3 w-3" />
          Suspended Accounts
        </button>
      </div>
    </div>
  );
}
