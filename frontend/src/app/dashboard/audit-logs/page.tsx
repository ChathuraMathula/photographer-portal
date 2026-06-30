"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Filter, Search, ClipboardList } from "lucide-react";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { Pagination } from "@/components/ui/pagination";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface AuditLogEntry {
  id: string;
  action: string;
  userEmail: string;
  details: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { role } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (actionFilter) queryParams.append("action", actionFilter);
      if (emailSearch) queryParams.append("userEmail", emailSearch);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      queryParams.append("page", page.toString());
      queryParams.append("limit", "15");

      const res = await fetch(`${API}/audit-logs?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load audit logs");
      const json = await res.json();
      
      // If the backend returned paginated data (has .data property)
      if (json.data && Array.isArray(json.data)) {
        setLogs(json.data);
        setTotalPages(json.totalPages || 1);
        setTotal(json.total || 0);
      } else {
        setLogs(json);
        setTotalPages(1);
        setTotal(json.length);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === UserRole.SUPER_ADMIN) {
      fetchLogs();
    }
  }, [role, page]);

  if (role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Access Denied. Super Admins only.
      </div>
    );
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "LOGIN_SUCCESS":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30";
      case "FORGOT_PASSWORD_REQUEST":
        return "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30";
      case "PASSWORD_RESET_SUCCESS":
        return "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/30";
      case "USER_CREATED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/20 dark:text-indigo-450 dark:border-indigo-900/30";
      case "USER_STATUS_TOGGLED":
        return "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30";
      case "SETTINGS_UPDATED":
        return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-950/20 dark:text-zinc-400 dark:border-zinc-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2">
            System Audit Logs
          </h1>
          <p className="text-body-small text-zinc-500 mt-1">
            Super Administrator console to monitor user logins, profile alterations, password recoveries, and activity logs.
          </p>
        </div>
        <Button
          onClick={fetchLogs}
          disabled={loading}
          variant="outline"
          className="h-11 px-4 gap-2 font-semibold shadow-sm border-zinc-200 dark:border-zinc-800 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Reload logs
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="overflow-visible border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-body-small-bold font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            Filter Log Data
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
          
          <div className="space-y-1.5">
            <Label htmlFor="actionFilter" className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">Action Type</Label>
            <select
              id="actionFilter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-[50px] px-3 rounded-lg border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-dark"
            >
              <option value="">All Actions</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="FORGOT_PASSWORD_REQUEST">FORGOT_PASSWORD_REQUEST</option>
              <option value="PASSWORD_RESET_SUCCESS">PASSWORD_RESET_SUCCESS</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_STATUS_TOGGLED">USER_STATUS_TOGGLED</option>
              <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
              <option value="PROFILE_UPDATED">PROFILE_UPDATED</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emailSearch" className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">User Email</Label>
            <div className="relative">
              <Input
                id="emailSearch"
                placeholder="name@example.com"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="h-[50px] text-xs pr-8 rounded-lg dark:bg-zinc-950"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <DatePickerInput
              label="Start"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate || undefined}
              buttonClassName="h-[50px] w-full text-xs justify-between font-normal border-zinc-250 dark:border-zinc-850 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <DatePickerInput
              label="End"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
              buttonClassName="h-[50px] w-full text-xs justify-between font-normal border-zinc-250 dark:border-zinc-850 dark:bg-zinc-950"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end">
            <Button
              onClick={() => {
                setPage(1);
                fetchLogs();
              }}
              className="btn btn-primary h-10 px-8 text-xs font-bold shadow-md cursor-pointer"
            >
              Apply Filters
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
            Activity Log Entries
          </CardTitle>
          <CardDescription className="text-xs">
            Viewing {logs.length} matched system logs out of {total} total.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-zinc-500 animate-pulse flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              Fetching log data...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 italic">
              No audit log entries matching filters were found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150/40 dark:border-zinc-850/60 bg-zinc-50/50 dark:bg-zinc-950/20 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">User Email</th>
                  <th className="py-4 px-6">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150/30 dark:divide-zinc-850/40 text-xs">
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-[11px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-700 dark:text-zinc-300">
                      {log.userEmail || <span className="text-zinc-400 italic">System</span>}
                    </td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="p-4 flex justify-center border-t border-zinc-150/40 dark:border-zinc-850/60">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
