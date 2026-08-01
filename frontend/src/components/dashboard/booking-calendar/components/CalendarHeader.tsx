"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  MONTHS,
  YEARS,
  STATUSES,
  EVENT_TYPES,
} from "../constants/calendarConstants";
import { CalendarFilterModal } from "@/components/modals/CalendarFilterModal";

interface Props {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  handleMonthChange: (val: string) => void;
  handleYearChange: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  eventTypeFilter: string;
  setEventTypeFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export function CalendarHeader(props: Props) {
  const [showFilterModal, setShowFilterModal] = useState(false);

  const yearsOptions = YEARS.map((y) => ({ name: y, value: y }));
  const labelClass =
    "text-[10px] uppercase font-bold text-zinc-455 dark:text-zinc-500 tracking-wider";
  const btnClass =
    "h-8 w-8 shrink-0 p-0 shadow-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800";

  const activeFiltersCount =
    (props.statusFilter !== "ALL" ? 1 : 0) +
    (props.eventTypeFilter !== "ALL" ? 1 : 0) +
    (props.searchQuery.trim() ? 1 : 0);

  return (
    <CardHeader className="flex flex-col gap-4 border-b border-zinc-150 dark:border-zinc-800/80 pb-5 bg-zinc-50/15">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0e2d5c]/10 dark:bg-white/10 rounded-xl text-[#0e2d5c] dark:text-white">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white leading-none">
              Visual Bookings Grid
            </CardTitle>
            <CardDescription className="text-body-caption text-zinc-500 mt-1.5">
              Navigate months or days, adjust search criteria, and configure
              settings.
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              type="button"
              onClick={props.onPrevMonth}
              className={btnClass}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-[120px] sm:w-[140px]">
              <SearchableSelect
                options={MONTHS}
                value={props.currentDate.getMonth().toString()}
                onValueChange={props.handleMonthChange}
              />
            </div>
            <div className="w-[95px] sm:w-[110px]">
              <SearchableSelect
                options={yearsOptions}
                value={props.currentDate.getFullYear().toString()}
                onValueChange={props.handleYearChange}
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              type="button"
              onClick={props.onNextMonth}
              className={btnClass}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Filter Row (hidden on mobile) */}
      <div className="hidden sm:grid grid-cols-3 gap-4 p-4 mt-2 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-150/70 dark:border-zinc-850/70 rounded-xl">
        <div className="flex flex-col gap-1.5 text-left">
          <span className={labelClass}>Status Filter</span>
          <SearchableSelect
            options={STATUSES}
            value={props.statusFilter}
            onValueChange={props.setStatusFilter}
          />
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <span className={labelClass}>Event Type</span>
          <SearchableSelect
            options={EVENT_TYPES}
            value={props.eventTypeFilter}
            onValueChange={props.setEventTypeFilter}
          />
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <span className={labelClass}>Search Bookings</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by client or location..."
              value={props.searchQuery}
              onChange={(e) => props.setSearchQuery(e.target.value)}
              className="h-8 w-full pl-9 pr-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-medium text-body-small focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Button & Search Row (shown only on mobile) */}
      <div className="flex sm:hidden items-center gap-2 mt-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={props.searchQuery}
            onChange={(e) => props.setSearchQuery(e.target.value)}
            className="h-9 w-full pl-9 pr-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#0e2d5c]"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilterModal(true)}
          className="h-9 px-3 border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="h-4 min-w-[16px] px-1 bg-[#0e2d5c] text-white dark:bg-white dark:text-zinc-900 rounded-full text-[9px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      <CalendarFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        statusFilter={props.statusFilter}
        setStatusFilter={props.setStatusFilter}
        eventTypeFilter={props.eventTypeFilter}
        setEventTypeFilter={props.setEventTypeFilter}
        searchQuery={props.searchQuery}
        setSearchQuery={props.setSearchQuery}
      />
    </CardHeader>
  );
}
