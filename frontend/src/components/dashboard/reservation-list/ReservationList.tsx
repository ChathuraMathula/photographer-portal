import React from "react";
import { type Reservation } from "@/types";
import { Card } from "@/components/ui/card";
import { ReservationListItem } from "./ReservationListItem";
import { ReservationListHeader } from "./components/ReservationListHeader";
import { ReservationListItemSkeleton } from "./components/ReservationListItemSkeleton";
import { ReservationListPagination } from "./components/ReservationListPagination";

type Props = {
  reservations: Reservation[];
  selectedId: string | undefined;
  onSelect: (res: Reservation) => void;
  page: number;
  setPage: (val: number) => void;
  totalPages: number;
  total: number;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
  loading: boolean;
};

export function ReservationList(props: Props) {
  const {
    reservations, selectedId, onSelect, page, setPage, totalPages, total, loading
  } = props;

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm h-[650px] flex flex-col rounded-xl overflow-visible">
      <ReservationListHeader
        total={total}
        search={props.search}
        setSearch={props.setSearch}
        statusFilter={props.statusFilter}
        setStatusFilter={props.setStatusFilter}
        sortBy={props.sortBy}
        setSortBy={props.setSortBy}
        sortOrder={props.sortOrder}
        setSortOrder={props.setSortOrder}
      />
      <div
        className={`flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 scrollbar-hide overflow-hidden transition-opacity duration-200 ${
          loading && reservations.length > 0 ? "opacity-50" : ""
        }`}
      >
        {loading && reservations.length === 0 ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <ReservationListItemSkeleton key={idx} />
          ))
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
        <ReservationListPagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}
    </Card>
  );
}
