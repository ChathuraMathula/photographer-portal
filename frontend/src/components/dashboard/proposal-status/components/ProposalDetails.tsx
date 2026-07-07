"use client";

import React from "react";
import { type Reservation } from "@/types";
import { CountdownTimer } from "@/components/tracking/CountdownTimer";

interface ProposalDetailsProps {
  reservation: Reservation;
  isExpired: boolean;
}

export function ProposalDetails({ reservation, isExpired }: ProposalDetailsProps) {
  return (
    <>
      <p className="text-zinc-650 dark:text-zinc-400">
        <strong className="text-zinc-800 dark:text-zinc-200">Status:</strong>{" "}
        <span className={`font-semibold uppercase ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-primary-light dark:text-indigo-400'}`}>
          {isExpired ? "EXPIRED" : reservation.status}
        </span>
      </p>

      {reservation.status === "PROPOSED" && reservation.paymentDeadline && (
        <div className="mt-2 space-y-2">
          <p className="text-zinc-500 dark:text-zinc-400 text-body-caption font-semibold">
            ⏰ Expiry Deadline: {new Date(reservation.paymentDeadline).toLocaleString()}
          </p>
          <CountdownTimer deadline={reservation.paymentDeadline} />
        </div>
      )}
    </>
  );
}
