"use client";

import React from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { InvoicesListTable } from "./components/InvoicesListTable";
import { InvoiceCustomizerCard } from "./components/InvoiceCustomizerCard";
import { Search, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useInvoices } from "./hooks/useInvoices";

export default function InvoicesPage() {
  const context = usePhotographerDashboardContext();
  
  if (!context) return null;
  const { authFetch } = context;

  const {
    invoices,
    settings,
    loading,
    resendingId,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalInvoiced,
    totalSettled,
    outstanding,
    handleDownload,
    handleResend,
    handleSaveSettings,
  } = useInvoices(authFetch);

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-dark"></div>
        <p className="text-zinc-500 font-medium text-body-small">Assembling billing statement ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4 gap-4">
        <div>
          <h2 className="text-title-medium font-extrabold text-zinc-900 dark:text-white leading-none">Invoices & Statements</h2>
          <p className="text-body-caption text-zinc-400 mt-1.5">
            Manage your customer invoice statements, log off-cash payments, and customize PDF templates.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">Total Value Invoiced</p>
            <p className="text-body-base-bold font-bold text-zinc-900 dark:text-white">LKR {totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">Payments Collected</p>
            <p className="text-body-base-bold font-bold text-emerald-600 dark:text-emerald-500">LKR {totalSettled.toLocaleString()}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider">Outstanding Balances</p>
            <p className="text-body-base-bold font-bold text-amber-600">LKR {outstanding.toLocaleString()}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customizer sidebar */}
        <div className="lg:col-span-1">
          <InvoiceCustomizerCard settings={settings} onSave={handleSaveSettings} />
        </div>

        {/* Invoices List Table & Filter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-body-base-bold font-bold text-zinc-850 dark:text-zinc-200">Generated Ledger Statements</h3>
            
            {/* Search Filter Input */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client or event..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          <InvoicesListTable
            invoices={invoices}
            onDownload={handleDownload}
            onResend={handleResend}
            resendingId={resendingId}
          />
          
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

