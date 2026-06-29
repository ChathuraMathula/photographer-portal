"use client";

import React from "react";
import { FileDown } from "lucide-react";
import { DatePickerInput } from "@/components/ui/DatePickerInput";

type ReportsHeaderProps = {
  period: "weekly" | "monthly" | "yearly" | "custom";
  onPeriodChange: (p: "weekly" | "monthly" | "yearly" | "custom") => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  selectedYear?: string;
  setSelectedYear?: (y: string) => void;
  selectedMonth?: string;
  setSelectedMonth?: (m: string) => void;
  downloadingFinancial: boolean;
  downloadingBookings: boolean;
  downloadingLocation?: boolean;
  onDownloadFinancial: () => void;
  onDownloadBookings: () => void;
  onDownloadLocation?: () => void;
};

export function ReportsHeader({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedYear = "",
  setSelectedYear,
  selectedMonth = "",
  setSelectedMonth,
  downloadingFinancial,
  downloadingBookings,
  downloadingLocation = false,
  onDownloadFinancial,
  onDownloadBookings,
  onDownloadLocation,
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

        {/* Yearly Range Selector */}
        {period === "yearly" && setSelectedYear && (
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold px-2 uppercase">Select Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        )}

        {/* Monthly Range Selector */}
        {period === "monthly" && setSelectedMonth && setSelectedYear && (
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold px-2 uppercase">Select Month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 cursor-pointer border-r border-zinc-200 dark:border-zinc-700/50 mr-1"
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        )}

        {/* Custom Date Inputs with premium calendar pickers */}
        {period === "custom" && (
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <DatePickerInput
              label="From"
              value={startDate}
              onChange={onStartDateChange}
              maxDate={endDate || undefined}
            />
            <span className="text-zinc-300 dark:text-zinc-700 text-sm font-light">—</span>
            <DatePickerInput
              label="To"
              value={endDate}
              onChange={onEndDateChange}
              minDate={startDate || undefined}
            />
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

        {/* Location Download Button */}
        {onDownloadLocation && (
          <button
            onClick={onDownloadLocation}
            disabled={downloadingLocation}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-body-caption font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {downloadingLocation ? "Generating..." : "Location PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
