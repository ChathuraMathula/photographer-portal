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
  const handleSelectReservation = (res: Reservation) => {
    setSelectedRes(res);
    setShowRejectForm(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("id", res.id);
      url.searchParams.set("page", page.toString());
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("page", newPage.toString());
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="lg:col-span-1">
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
