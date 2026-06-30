"use client";

import React, { useEffect } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, DollarSign, Wallet, CheckCircle, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionsPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;

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
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL"); // ALL, SUCCESS, FAILED
  const [methodFilter, setMethodFilter] = React.useState("ALL"); // ALL, CARD, CASH

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setTransactionsPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    loadTransactions({
      page: transactionsPage,
      search: debouncedSearch,
      status: statusFilter,
      method: methodFilter,
    });
  }, [transactionsPage, debouncedSearch, statusFilter, methodFilter]);

  // Compute stats from server aggregations
  const totalCollectedLkr = (transactionStats?.totalRevenueInCents || 0) / 100;
  const cardPaymentsCount = transactionStats?.cardPaymentsCount || 0;
  const cashPaymentsCount = transactionStats?.cashPaymentsCount || 0;

  // Filter logic: backend handles filter, so filteredTransactions is just transactions
  const filteredTransactions = transactions;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <p className="text-body-caption text-zinc-550 dark:text-zinc-400 mt-1">
          Monitor your customer bookings card checkout logs and manual offline cash transactions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-body-caption font-bold text-zinc-500 uppercase tracking-wider">
              Total Volume
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
              LKR {totalCollectedLkr.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              From {cardPaymentsCount + cashPaymentsCount} successful bookings
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
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
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
            <div className="text-title-medium font-bold text-zinc-900 dark:text-white">
              {cashPaymentsCount} Logs
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Logged offline manually by you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Input
            type="text"
            placeholder="Search by customer name, email, transaction ID or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-9 pr-3 text-body-small bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all text-zinc-700 dark:text-zinc-300 placeholder-zinc-400"
          />
          <Search className="absolute left-3 top-2 h-4 w-4 text-zinc-400" />
        </div>
        <div className="w-full sm:w-auto flex gap-3">
          <div className="flex-1 sm:flex-initial">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-8 px-3 text-body-small bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 sm:flex-initial">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full h-8 px-3 text-body-small bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="CARD">Card Payments</SelectItem>
                <SelectItem value="CASH">Cash / Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <CardTitle className="text-body-base-bold text-zinc-900 dark:text-white font-bold">
            Live Transactions History
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            A history of all deposit actions logged in your system.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transactionsLoading ? (
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
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={`skeleton-row-${i}`} className="hover:bg-zinc-50/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-4 w-28 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                        <div className="h-3 w-40 bg-zinc-150/50 dark:bg-zinc-850/50 rounded mt-1.5" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3.5 w-32 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-zinc-150/50 dark:bg-zinc-850/50 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-zinc-150/50 dark:bg-zinc-850/50 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-small text-zinc-400 italic">
                No transactions recorded yet.
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-small text-zinc-400 italic">
                No transactions match the selected filters.
              </p>
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
                  {filteredTransactions.map((txn) => {
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
                          <div className="font-medium text-zinc-800 dark:text-zinc-200">
                            {txn.cardBrand}
                          </div>
                          {txn.cardLast4 && txn.cardLast4 !== "Cash" && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              •••• {txn.cardLast4}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                          LKR {((txn.amountInCents || 0) / 100).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                          {new Date(txn.createdAt).toLocaleDateString()}
                          <span className="text-[10px] block text-zinc-400 mt-0.5">
                            {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {transactionsTotalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-sm gap-4">
          <div className="text-body-caption text-zinc-500">
            Showing page <span className="font-semibold text-zinc-800 dark:text-zinc-200">{transactionsPage}</span> of{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{transactionsTotalPages}</span> ({transactionsTotal} total transactions)
          </div>
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
