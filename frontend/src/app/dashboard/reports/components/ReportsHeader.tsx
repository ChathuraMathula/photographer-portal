"use client";

import React from "react";
import { FileDown } from "lucide-react";

type ReportsHeaderProps = {
  period: "weekly" | "monthly" | "yearly" | "custom";
  onPeriodChange: (p: "weekly" | "monthly" | "yearly" | "custom") => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  downloadingFinancial: boolean;
  downloadingBookings: boolean;
  onDownloadFinancial: () => void;
  onDownloadBookings: () => void;
};

export function ReportsHeader({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  downloadingFinancial,
  downloadingBookings,
  onDownloadFinancial,
  onDownloadBookings,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
      <div>
        <h2 className="text-title-medium font-extrabold text-zinc-900 dark:text-white leading-none">Reports & Analytics</h2>
        <p className="text-body-caption text-zinc-500 mt-1.5">
          Analyze revenue margins, booking trends, package popularity, and event distribution.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Period Selector Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shadow-inner border border-zinc-200/50 dark:border-zinc-700/50">
          {(["weekly", "monthly", "yearly", "custom"] as const).map((p) => (
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

        {/* Custom Date Inputs (appears when period === 'custom') */}
        {period === "custom" && (
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold text-zinc-400">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-8 px-2 text-body-caption border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold text-zinc-400">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-8 px-2 text-body-caption border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
          </div>
        )}

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
