import React from "react";
import { Search, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { CardHeader, CardTitle } from "@/components/ui/card";

const SORT_OPTIONS = [
  { name: "Date ↓ (Newest First)", value: "date|DESC" },
  { name: "Date ↑ (Oldest First)", value: "date|ASC" },
  { name: "Name A – Z", value: "customerFirstName|ASC" },
  { name: "Name Z – A", value: "customerFirstName|DESC" },
];

type Props = {
  total: number;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
};

export function ReservationListHeader({
  total,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: Props) {
  const sortValue = `${sortBy}|${sortOrder}`;

  const handleSortChange = (val: string) => {
    const [field, order] = val.split("|");
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 shrink-0">
      <div className="flex justify-between items-center">
        <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">
          Requests List
        </CardTitle>
        <span className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-body-caption font-semibold text-zinc-700 dark:text-zinc-300">
          Total: {total}
        </span>
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {/* Search */}
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

        {/* Status filter */}
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

        {/* Sort order */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <SearchableSelect
            options={SORT_OPTIONS}
            value={sortValue}
            onValueChange={handleSortChange}
            placeholder="Sort by..."
            searchPlaceholder="Search sort..."
          />
        </div>
      </div>
    </CardHeader>
  );
}
