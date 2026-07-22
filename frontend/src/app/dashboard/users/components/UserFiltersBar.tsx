import React from "react";
import { Search } from "lucide-react";
import { UserRole } from "@/store/slices/authSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  loggedInRole: UserRole | string | null;
}

export function UserFiltersBar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  loggedInRole,
}: UserFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white dark:bg-zinc-900 p-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-9 pr-3 bg-zinc-50 border border-zinc-250 rounded-lg text-body-small focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
        />
      </div>
      <div className="flex gap-3">
        {loggedInRole === UserRole.SUPER_ADMIN && (
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[160px] h-10 bg-zinc-50 border-zinc-250 dark:bg-zinc-800 dark:border-zinc-700">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="PHOTOGRAPHER">Photographers</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] h-10 bg-zinc-50 border-zinc-250 dark:bg-zinc-800 dark:border-zinc-700">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
