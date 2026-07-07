"use client";

import { type Reservation } from "@/types";

interface ReservationUpdatedContext {
  reservationsState: any;
  loadTransactions: () => Promise<void>;
}

export function handleReservationUpdated(
  updatedRes: Reservation,
  ctx: ReservationUpdatedContext,
) {
  ctx.reservationsState.setReservations((prev: Reservation[]) =>
    prev.map((r) => (r.id === updatedRes.id ? updatedRes : r)),
  );

  ctx.reservationsState.setSelectedRes((prev: Reservation | null) =>
    prev && prev.id === updatedRes.id ? updatedRes : prev,
  );

  ctx.loadTransactions();
}
