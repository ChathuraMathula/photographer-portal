import React from "react";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, BarChart3 } from "lucide-react";

type Props = {
  period: string;
  setPeriod: (p: any) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  downloadingFinancial: boolean;
  handleDownloadFinancial: () => void;
  downloadingBookings: boolean;
  handleDownloadBookings: () => void;
  downloadingLocation: boolean;
  handleDownloadLocation: () => void;
};

export function AdminReportsHeader({
  period,
  setPeriod,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  downloadingFinancial,
  handleDownloadFinancial,
  downloadingBookings,
  handleDownloadBookings,
  downloadingLocation,
  handleDownloadLocation,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-zinc-400" /> System Reports &amp;
          Analytics
        </h1>
        <p className="text-body-small text-zinc-500">
          View aggregated platform performance, revenue distributions, and
          photographer leaderboards.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {(["weekly", "monthly", "yearly", "custom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${period === p ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
            >
              {p}
            </button>
          ))}
        </div>
        {period === "yearly" && (
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-955 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold px-2 uppercase whitespace-nowrap">
              Select Year
            </span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-8 w-[100px] border-none bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:ring-0 cursor-pointer text-xs font-semibold text-zinc-800 dark:text-zinc-205">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <SelectItem value="2024" className="cursor-pointer">
                  2024
                </SelectItem>
                <SelectItem value="2025" className="cursor-pointer">
                  2025
                </SelectItem>
                <SelectItem value="2026" className="cursor-pointer">
                  2026
                </SelectItem>
                <SelectItem value="2027" className="cursor-pointer">
                  2027
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {period === "monthly" && (
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-955 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-semibold px-2 uppercase whitespace-nowrap">
              Select Month
            </span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-8 w-[120px] border-none bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:ring-0 cursor-pointer border-r border-zinc-200 dark:border-zinc-700/50 rounded-none pr-4 text-xs font-semibold text-zinc-800 dark:text-zinc-205">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <SelectItem value="01" className="cursor-pointer">
                  January
                </SelectItem>
                <SelectItem value="02" className="cursor-pointer">
                  February
                </SelectItem>
                <SelectItem value="03" className="cursor-pointer">
                  March
                </SelectItem>
                <SelectItem value="04" className="cursor-pointer">
                  April
                </SelectItem>
                <SelectItem value="05" className="cursor-pointer">
                  May
                </SelectItem>
                <SelectItem value="06" className="cursor-pointer">
                  June
                </SelectItem>
                <SelectItem value="07" className="cursor-pointer">
                  July
                </SelectItem>
                <SelectItem value="08" className="cursor-pointer">
                  August
                </SelectItem>
                <SelectItem value="09" className="cursor-pointer">
                  September
                </SelectItem>
                <SelectItem value="10" className="cursor-pointer">
                  October
                </SelectItem>
                <SelectItem value="11" className="cursor-pointer">
                  November
                </SelectItem>
                <SelectItem value="12" className="cursor-pointer">
                  December
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-8 w-[100px] border-none bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:ring-0 cursor-pointer pl-2 text-xs font-semibold text-zinc-800 dark:text-zinc-205">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <SelectItem value="2024" className="cursor-pointer">
                  2024
                </SelectItem>
                <SelectItem value="2025" className="cursor-pointer">
                  2025
                </SelectItem>
                <SelectItem value="2026" className="cursor-pointer">
                  2026
                </SelectItem>
                <SelectItem value="2027" className="cursor-pointer">
                  2027
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {period === "custom" && (
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <DatePickerInput
              label="From"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate || undefined}
            />
            <span className="text-zinc-300 dark:text-zinc-700 text-xs font-light">
              —
            </span>
            <DatePickerInput
              label="To"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || undefined}
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={downloadingFinancial}
            onClick={handleDownloadFinancial}
            className="h-9 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
          >
            {downloadingFinancial ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}{" "}
            Financial PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={downloadingBookings}
            onClick={handleDownloadBookings}
            className="h-9 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
          >
            {downloadingBookings ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}{" "}
            Bookings PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={downloadingLocation}
            onClick={handleDownloadLocation}
            className="h-9 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
          >
            {downloadingLocation ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}{" "}
            Location PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
