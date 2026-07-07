"use client";

import React from "react";
import { type Reservation } from "@/types";
import { X } from "lucide-react";
import { StatusBadge } from "@/components/feedback/StatusBadge";

interface HeaderProps {
  reservation: Reservation;
  onClose: () => void;
}

export function BookingDetailsHeader({ reservation, onClose }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4 bg-zinc-55/10 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
          Booking Details
        </h2>
        <StatusBadge status={reservation.status} />
      </div>
      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
