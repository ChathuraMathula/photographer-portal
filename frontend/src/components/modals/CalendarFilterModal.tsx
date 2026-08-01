"use client";

import React from "react";
import { ModalLayout } from "./ModalLayout";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Search, Filter, RotateCcw } from "lucide-react";
import {
  STATUSES,
  EVENT_TYPES,
} from "@/components/dashboard/booking-calendar/constants/calendarConstants";

type CalendarFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  eventTypeFilter: string;
  setEventTypeFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
};

export function CalendarFilterModal({
  isOpen,
  onClose,
  statusFilter,
  setStatusFilter,
  eventTypeFilter,
  setEventTypeFilter,
  searchQuery,
  setSearchQuery,
}: CalendarFilterModalProps) {
  if (!isOpen) return null;

  const activeCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (eventTypeFilter !== "ALL" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleReset = () => {
    setStatusFilter("ALL");
    setEventTypeFilter("ALL");
    setSearchQuery("");
  };

  const labelClass =
    "text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider";

  return (
    <ModalLayout
      title="Filter Bookings"
      onClose={onClose}
      asForm={false}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        {/* Search Query */}
        <div className="flex flex-col gap-1.5 text-left">
          <span className={labelClass}>Search Bookings</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search client or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 pr-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#0e2d5c]"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5 text-left">
          <span className={labelClass}>Status Filter</span>
          <SearchableSelect
            options={STATUSES}
            value={statusFilter}
            onValueChange={setStatusFilter}
          />
        </div>

        {/* Event Type Filter */}
        <div className="flex flex-col gap-1.5 text-left">
          <span className={labelClass}>Event Type</span>
          <SearchableSelect
            options={EVENT_TYPES}
            value={eventTypeFilter}
            onValueChange={setEventTypeFilter}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-150 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleReset}
            disabled={activeCount === 0}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#0e2d5c] hover:bg-[#0b244a] text-white text-xs px-5 h-9"
          >
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
