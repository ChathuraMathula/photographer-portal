"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { type Reservation } from "@/types";
import { ReservationList } from "../../reservation-list/ReservationList";

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
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
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
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  reservationsLoading,
}: ReservationsLeftPaneProps) {
  const router = useRouter();

  const handleSelectReservation = (res: Reservation) => {
    setSelectedRes(res);
    setShowRejectForm(false);
    router.push(`/dashboard/reservations/${res.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="w-full">
      <ReservationList
        reservations={reservations}
        selectedId={selectedRes?.id}
        onSelect={handleSelectReservation}
        page={page}
        setPage={handlePageChange}
        totalPages={totalPages}
        total={total}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        loading={reservationsLoading}
      />
    </div>
  );
}
