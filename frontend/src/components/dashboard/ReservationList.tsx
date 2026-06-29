import React, { useState } from "react";
import { type Reservation } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationListItem } from "./ReservationListItem";
import { Search } from "lucide-react";

type Props = {
  reservations: Reservation[];
  selectedId: string | undefined;
  onSelect: (res: Reservation) => void;
};

export function ReservationList({ reservations, selectedId, onSelect }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredReservations = reservations.filter((res) => {
    if (statusFilter !== "ALL" && res.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${res.customer?.firstName ?? ""} ${res.customer?.lastName ?? ""}`.toLowerCase();
      const location = (res.location ?? "").toLowerCase();
      const eventType = (res.eventType ?? "").toLowerCase();
      return name.includes(q) || location.includes(q) || eventType.includes(q);
    }
    return true;
  });

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm h-[600px] flex flex-col rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">Requests List</CardTitle>
          <span className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-body-caption font-semibold text-zinc-700 dark:text-zinc-300">
            Count: {filteredReservations.length}
          </span>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search request or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[50px] pl-10 pr-3 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:ring-1 focus:ring-primary-dark"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[50px] px-3 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-dark"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROPOSED">PROPOSED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 scrollbar-hide">
        {filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-body-small">
            No reservations found.
          </div>
        ) : (
          filteredReservations.map((res) => (
            <ReservationListItem
              key={res.id}
              reservation={res}
              isSelected={selectedId === res.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </Card>
  );
}
