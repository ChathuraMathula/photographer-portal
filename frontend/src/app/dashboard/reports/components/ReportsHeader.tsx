"use client";

import React from "react";
import { FileDown } from "lucide-react";

type ReportsHeaderProps = {
  period: "weekly" | "monthly" | "yearly";
  onPeriodChange: (p: "weekly" | "monthly" | "yearly") => void;
  downloadingFinancial: boolean;
  downloadingBookings: boolean;
  onDownloadFinancial: () => void;
  onDownloadBookings: () => void;
};

export function ReportsHeader({
  period,
  onPeriodChange,
  downloadingFinancial,
  downloadingBookings,
  onDownloadFinancial,
  onDownloadBookings,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
      <div>
        <p className="text-body-caption text-zinc-500 mt-1">
          Analyze revenue margins, booking trends, package popularity, and event distribution.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Period Selector Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
          {(["weekly", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-1.5 rounded-lg text-body-caption font-semibold transition-all cursor-pointer ${
                period === p
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Financial Download Button */}
        <button
          onClick={onDownloadFinancial}
          disabled={downloadingFinancial}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-body-caption font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" />
          {downloadingFinancial ? "Generating..." : "Financial PDF"}
        </button>

        {/* Bookings Download Button */}
        <button
          onClick={onDownloadBookings}
          disabled={downloadingBookings}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-body-caption font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" />
          {downloadingBookings ? "Generating..." : "Bookings PDF"}
        </button>
      </div>
    </div>
  );
}
