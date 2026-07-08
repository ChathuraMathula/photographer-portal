"use client";

import { toast } from "sonner";
import { type Reservation } from "@/types";

interface ReservationCreatedContext {
  reservationsState: any;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  loadTransactions: () => Promise<void>;
  router: any;
}

export function handleReservationCreated(
  newRes: Reservation,
  ctx: ReservationCreatedContext,
) {
  ctx.reservationsState.setReservations((prev: Reservation[]) => {
    if (prev.some((r) => r.id === newRes.id)) return prev;
    return [newRes, ...prev];
  });

  ctx.setNotifications((prev) => [
    {
      id: `booking_${newRes.id}_${Date.now()}`,
      title: "New Booking Request",
      description: `${newRes.customer?.firstName ?? "Client"} requested a ${newRes.eventType} session.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "booking" as const,
      referenceId: newRes.id,
    },
    ...prev,
  ]);

  ctx.loadTransactions();
  toast.info(
    `New booking request from ${newRes.customer?.firstName ?? "Client"}!`,
    {
      action: {
        label: "View",
        onClick: () => {
          ctx.reservationsState.setSelectedRes(newRes);
          ctx.router.push(`/dashboard/reservations?id=${newRes.id}&fromNotification=true`);
        },
      },
      duration: 6000,
    }
  );
}
