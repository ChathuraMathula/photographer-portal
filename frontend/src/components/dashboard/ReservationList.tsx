import React, { useState } from "react";
import { type Reservation } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationListItem } from "./ReservationListItem";
import { Search, X } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

type Props = {
  reservations: Reservation[];
  selectedId: string | undefined;
  onSelect: (res: Reservation) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  total: number;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  loading: boolean;
};

export function ReservationList({
  reservations,
  selectedId,
  onSelect,
  page,
  setPage,
  totalPages,
  total,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  loading,
}: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm h-[650px] flex flex-col rounded-xl overflow-visible">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">Requests List</CardTitle>
          <span className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-body-caption font-semibold text-zinc-700 dark:text-zinc-300">
            Total: {total}
          </span>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search request or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-10 pr-10 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-primary-dark"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-150 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
                title="Reset search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <SearchableSelect
            options={[
              { name: "All Statuses", value: "ALL" },
              { name: "PENDING", value: "PENDING" },
              { name: "PROPOSED", value: "PROPOSED" },
              { name: "CONFIRMED", value: "CONFIRMED" },
              { name: "COMPLETED", value: "COMPLETED" },
              { name: "CANCELLED", value: "CANCELLED" },
              { name: "REJECTED", value: "REJECTED" },
            ]}
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Select Status"
            searchPlaceholder="Search status..."
          />
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 scrollbar-hide overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400 text-body-small animate-pulse">
            Loading reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-body-small">
            No reservations found.
          </div>
        ) : (
          reservations.map((res) => (
            <ReservationListItem
              key={res.id}
              reservation={res}
              isSelected={selectedId === res.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 shrink-0 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-[11px] text-zinc-450 whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="scale-90 origin-right shrink-0"
          />
        </div>
      )}
    </Card>
  );
}
