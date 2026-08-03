"use client";

import React from "react";
import { Download, Mail } from "lucide-react";

type InvoiceItem = {
  reservation: {
    id: string;
    date: string;
    eventType: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  totalPaidLkr: number;
  totalValueLkr: number;
};

type InvoicesListTableProps = {
  invoices: InvoiceItem[];
  onDownload: (resId: string) => void;
  onResend: (resId: string) => void;
  resendingId: string | null;
};

export function InvoicesListTable({
  invoices,
  onDownload,
  onResend,
  resendingId,
}: InvoicesListTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl">
        <p className="text-body-small text-zinc-400 italic">
          No generated invoices found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-sm w-full min-w-0 max-w-full">
      <div className="overflow-x-auto w-full min-w-0 max-w-full">
        <table className="w-full text-left text-body-small border-collapse min-w-[550px]">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-550 border-b border-zinc-100 dark:border-zinc-850">
              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">
                Invoice No.
              </th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">
                Event Details
              </th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider">
                Amount Settled
              </th>
              <th className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-805">
            {invoices.map((inv) => {
              const resId = inv.reservation.id;
              const shortId = resId.slice(0, 8).toUpperCase();
              return (
                <tr
                  key={resId}
                  className="hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                    INV-{shortId}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {inv.reservation.customer.firstName}{" "}
                      {inv.reservation.customer.lastName}
                    </p>
                    <p className="text-[11px] text-zinc-450 dark:text-zinc-500">
                      {inv.reservation.customer.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-305">
                      {inv.reservation.eventType}
                    </p>
                    <p className="text-[11px]">
                      {new Date(inv.reservation.date).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                    LKR {inv.totalPaidLkr.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 shrink-0">
                    <button
                      onClick={() => onDownload(resId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                    <button
                      onClick={() => onResend(resId)}
                      disabled={resendingId === resId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Mail className="h-3 w-3" />
                      {resendingId === resId ? "Sending..." : "Resend"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
