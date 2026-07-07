"use client";

import React from "react";
import { type Reservation } from "@/types";
import { ReservationList } from "../../ReservationList";

interface ReservationsLeftPaneProps {
  reservations: Reservation[];
  selectedRes: Reservation | null;
  setSelectedRes: (res: Reservation | null) => void;
  setShowRejectForm: (show: boolean) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  total: number;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  reservationsLoading: boolean;
}

export function ReservationsLeftPane({
  reservations,
  selectedRes,
  setSelectedRes,
  setShowRejectForm,
  page,
  setPage,
  totalPages,
  total,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  reservationsLoading,
}: ReservationsLeftPaneProps) {
  const handleSelectReservation = (res: Reservation) => {
    setSelectedRes(res);
    setShowRejectForm(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/dashboard/reservations?id=${res.id}`,
      );
    }
  };

  return (
    <div className="lg:col-span-1">
      <ReservationList
        reservations={reservations}
        selectedId={selectedRes?.id}
        onSelect={handleSelectReservation}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        loading={reservationsLoading}
      />
    </div>
  );
}
