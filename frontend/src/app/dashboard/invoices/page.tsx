"use client";

import React from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { InvoicesListTable } from "./components/InvoicesListTable";
import { InvoiceCustomizerCard } from "./components/InvoiceCustomizerCard";
import { Search, DollarSign, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices } from "./hooks/useInvoices";

// Outer guard — only renders inner component once context is ready.
// This pattern prevents a React Rules of Hooks violation where useInvoices
// was called conditionally (after an early return), causing remounts on search.
export default function InvoicesPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;
  return <InvoicesPageInner authFetch={context.authFetch} />;
}

function InvoicesPageInner({
  authFetch,
}: {
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
}) {
  const {
    invoices,
    settings,
    loading,
    refreshing,
    resendingId,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalInvoiced,
    totalSettled,
    outstanding,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterDate,
    setFilterDate,
    handleDownload,
    handleResend,
    handleSaveSettings,
  } = useInvoices(authFetch);

  // Only block the UI on the very first load (before settings exist)
  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-dark"></div>
        <p className="text-zinc-500 font-medium text-body-small">
          Assembling billing statement ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4 gap-4">
        <div>
          <h2 className="text-title-medium font-extrabold text-zinc-900 dark:text-white leading-none">
            Invoices &amp; Statements
          </h2>
          <p className="text-body-caption text-zinc-400 mt-1.5">
            Manage your customer invoice statements, log off-cash payments, and
            customize PDF templates.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">
              Total Value Invoiced
            </p>
            <p className="text-body-base-bold font-bold text-zinc-900 dark:text-white">
              LKR {totalInvoiced.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">
              Payments Collected
            </p>
            <p className="text-body-base-bold font-bold text-emerald-600 dark:text-emerald-500">
              LKR {totalSettled.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">
              Outstanding Balances
            </p>
            <p className="text-body-base-bold font-bold text-amber-600">
              LKR {outstanding.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customizer sidebar */}
        <div className="lg:col-span-1">
          <InvoiceCustomizerCard
            settings={settings}
            onSave={handleSaveSettings}
          />
        </div>

        {/* Invoices List Table & Filter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <h3 className="text-body-base-bold font-bold text-zinc-850 dark:text-zinc-200">
              Generated Ledger Statements
            </h3>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              {/* Search Filter Input */}
              <div className="relative max-w-[200px] w-full min-w-[150px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by client or event..."
                  className="w-full h-8 pl-8 pr-3 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                />
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
              </div>

              {/* Date Filter */}
              <div className="shrink-0">
                <DatePickerInput
                  label="Filter:"
                  value={filterDate}
                  onChange={setFilterDate}
                />
              </div>

              {/* Sort By Select */}
              <div className="w-[110px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Client Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order Select */}
              <div className="w-[100px]">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Desc</SelectItem>
                    <SelectItem value="ASC">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              {(searchTerm || filterDate || sortBy !== "date" || sortOrder !== "DESC") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDate("");
                    setSortBy("date");
                    setSortOrder("DESC");
                  }}
                  className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table — stays mounted; dims smoothly during search refresh */}
          <div className={`transition-opacity duration-200 ${refreshing ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <InvoicesListTable
              invoices={invoices}
              onDownload={handleDownload}
              onResend={handleResend}
              resendingId={resendingId}
            />
          </div>

          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
