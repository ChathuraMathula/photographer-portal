"use client";

import React from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, DollarSign, Wallet, CheckCircle, XCircle } from "lucide-react";

export default function TransactionsPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const { transactions } = context;

  // Compute stats
  const successfulTransactions = transactions.filter((t) => t.status === "SUCCESS");

  const totalCollectedCents = successfulTransactions.reduce((acc, t) => acc + (t.amountInCents || 0), 0);
  const totalCollectedLkr = totalCollectedCents / 100;

  const cardPaymentsCount = successfulTransactions.filter(
    (t) => t.cardBrand !== "Offline Payment"
  ).length;

  const cashPaymentsCount = successfulTransactions.filter(
    (t) => t.cardBrand === "Offline Payment"
  ).length;

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
              From {successfulTransactions.length} successful bookings
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
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-small text-zinc-400 italic">
                No transactions recorded yet.
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
                  {transactions.map((txn) => {
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
                          <div className="font-semibold text-zinc-850 dark:text-zinc-200">{custName}</div>
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
    </div>
  );
}
