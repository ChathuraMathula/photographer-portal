import React from "react";
import { type Reservation } from "@/types";
import { Card } from "@/components/ui/card";
import { ReservationListItem } from "./ReservationListItem";
import { Pagination } from "@/components/ui/pagination";
import { ReservationListHeader } from "./reservation-list/components/ReservationListHeader";

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
      <ReservationListHeader
        total={total}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
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
