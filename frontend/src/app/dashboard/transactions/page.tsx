"use client";

import React, { useEffect, useState } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  DollarSign,
  CreditCard,
  Wallet,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Outer guard — prevents React Rules of Hooks violation
export default function TransactionsPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;
  return <TransactionsPageInner context={context} />;
}

function TransactionsPageInner({ context }: { context: any }) {
  const {
    transactions,
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    transactionsTotal,
    transactionStats,
    transactionsLoading,
    loadTransactions,
  } = context;

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [filterDate, setFilterDate] = useState("");
  const [initialised, setInitialised] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setTransactionsPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset to page 1 when non-search filters change
  useEffect(() => {
    if (!initialised) return;
    setTransactionsPage(1);
  }, [statusFilter, methodFilter, sortBy, sortOrder, filterDate]);

  // Fetch on filter/page change
  useEffect(() => {
    loadTransactions({
      page: transactionsPage,
      search: debouncedSearch,
      status: statusFilter,
      method: methodFilter,
      sortBy,
      sortOrder,
      filterDate,
    });
    if (!initialised) setInitialised(true);
  }, [transactionsPage, debouncedSearch, statusFilter, methodFilter, sortBy, sortOrder, filterDate]);

  // KPI values — always reflect filtered backend stats
  const totalCollectedLkr = (transactionStats?.totalRevenueInCents || 0) / 100;
  const cardPaymentsCount = transactionStats?.cardPaymentsCount || 0;
  const cashPaymentsCount = transactionStats?.cashPaymentsCount || 0;
  const isFiltered =
    !!searchTerm || !!filterDate || statusFilter !== "ALL" || methodFilter !== "ALL";

  const hasActiveFilters =
    !!searchTerm || !!filterDate || statusFilter !== "ALL" || methodFilter !== "ALL" ||
    sortBy !== "date" || sortOrder !== "DESC";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header + Filter Bar */}
      <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4 space-y-3">
        <div>
          <h2 className="text-title-medium font-extrabold text-zinc-900 dark:text-white leading-none">
            Transactions
          </h2>
          <p className="text-body-caption text-zinc-400 mt-1.5">
            Monitor your customer bookings card checkout logs and manual offline
            cash transactions.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-[260px] shrink-0">
            <input
              type="text"
              placeholder="Search name, email, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 font-medium"
            />
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
          </div>

          {/* Status */}
          <div className="w-[130px] shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Method */}
          <div className="w-[130px] shrink-0">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="shrink-0">
            <DatePickerInput
              label="Date:"
              value={filterDate}
              onChange={(val) => { setFilterDate(val); }}
            />
          </div>

          {/* Sort by */}
          <div className="w-[120px] shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort: Date</SelectItem>
                <SelectItem value="amount">Sort: Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order */}
          <div className="w-[100px] shrink-0">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full h-8 px-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Newest</SelectItem>
                <SelectItem value="ASC">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFilterDate("");
                setStatusFilter("ALL");
                setMethodFilter("ALL");
                setSortBy("date");
                setSortOrder("DESC");
                setTransactionsPage(1);
              }}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards — values reflect current search/filter results */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-body-caption font-bold text-zinc-500 uppercase tracking-wider">
              {isFiltered ? "Filtered Volume" : "Total Volume"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-title-medium font-bold text-zinc-900 dark:text-white transition-opacity duration-200 ${transactionsLoading ? "opacity-40" : ""}`}>
              LKR {totalCollectedLkr.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              From {cardPaymentsCount + cashPaymentsCount} successful
              {isFiltered ? " matching" : ""} bookings
            </p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-body-caption font-bold text-zinc-500 uppercase tracking-wider">
              Card Checkouts
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-title-medium font-bold text-zinc-900 dark:text-white transition-opacity duration-200 ${transactionsLoading ? "opacity-40" : ""}`}>
              {cardPaymentsCount} Payments
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Simulated Sri Lankan transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-body-caption font-bold text-zinc-500 uppercase tracking-wider">
              Manual Cash Log
            </CardTitle>
            <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-title-medium font-bold text-zinc-900 dark:text-white transition-opacity duration-200 ${transactionsLoading ? "opacity-40" : ""}`}>
              {cashPaymentsCount} Logs
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Logged offline manually by you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">
            Live Transactions History
          </CardTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            {transactionsTotal > 0
              ? `${transactionsTotal} transaction${transactionsTotal !== 1 ? "s" : ""} found`
              : "A history of all deposit actions logged in your system."}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table content dims when loading subsequent pages */}
          <div className={`transition-opacity duration-200 ${transactionsLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            {transactions.length === 0 && !transactionsLoading ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-body-small text-zinc-500 font-medium">
                  {hasActiveFilters ? "No transactions match your filters." : "No transactions recorded yet."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setSearchTerm(""); setFilterDate(""); setStatusFilter("ALL"); setMethodFilter("ALL"); setSortBy("date"); setSortOrder("DESC"); }}
                    className="text-xs text-primary-dark underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-small border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-550 border-b border-zinc-100 dark:border-zinc-855">
                      <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {transactions.map((txn: any) => {
                      const custName = txn.reservation?.customer
                        ? `${txn.reservation.customer.firstName} ${txn.reservation.customer.lastName}`
                        : "Manual Client";
                      const isSuccess = txn.status === "SUCCESS";
                      return (
                        <tr
                          key={txn.id}
                          className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-zinc-855 dark:text-zinc-200">{custName}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {txn.reservation?.customer?.email || "No email"}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                            {txn.transactionId}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-zinc-800 dark:text-zinc-200">{txn.cardBrand}</div>
                            {txn.cardLast4 && txn.cardLast4 !== "Cash" && (
                              <div className="text-[10px] text-zinc-400 mt-0.5">•••• {txn.cardLast4}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                            LKR {((txn.amountInCents || 0) / 100).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                            {new Date(txn.createdAt).toLocaleDateString()}
                            <span className="text-[10px] block text-zinc-400 mt-0.5">
                              {new Date(txn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/50">
                                <CheckCircle className="h-3 w-3 shrink-0" />
                                Success
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/25 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 cursor-help"
                                title={txn.errorMessage}
                              >
                                <XCircle className="h-3 w-3 shrink-0" />
                                Declined
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Skeleton rows shown on initial/full load */}
          {transactionsLoading && transactions.length === 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-small border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-550 border-b border-zinc-100 dark:border-zinc-855">
                    {["Customer", "Transaction ID", "Method", "Amount", "Date", "Status"].map((h) => (
                      <th key={h} className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 animate-pulse">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <tr key={`sk-${i}`}>
                      <td className="px-6 py-4">
                        <div className="h-4 w-28 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                        <div className="h-3 w-36 bg-zinc-150/50 dark:bg-zinc-850/50 rounded mt-1.5" />
                      </td>
                      <td className="px-6 py-4"><div className="h-3.5 w-32 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-zinc-150/50 dark:bg-zinc-850/50 rounded-full" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {transactionsTotalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-3">
          <p className="text-body-caption text-zinc-500">
            Page{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{transactionsPage}</span>
            {" "}of{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{transactionsTotalPages}</span>
            {" "}·{" "}
            <span className="text-zinc-400">{transactionsTotal} total</span>
          </p>
          <Pagination
            page={transactionsPage}
            totalPages={transactionsTotalPages}
            onPageChange={setTransactionsPage}
          />
        </div>
      )}
    </div>
  );
}
