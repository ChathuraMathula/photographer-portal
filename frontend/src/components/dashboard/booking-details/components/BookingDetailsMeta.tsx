"use client";

import React from "react";
import { type Reservation } from "@/types";
import { Calendar, Clock, User, Mail, Phone, Tag } from "lucide-react";
import { CustomerTrackingBlock } from "../../customer-details/components/CustomerTrackingBlock";

interface MetaProps {
  reservation: Reservation;
  copiedId: boolean;
  copiedLink: boolean;
  handleCopyId: () => void;
  handleCopyLink: () => void;
}

export function BookingDetailsMeta({
  reservation,
  copiedId,
  copiedLink,
  handleCopyId,
  handleCopyLink,
}: MetaProps) {
  const rowClass = "flex items-center gap-3 text-body-small text-zinc-650 dark:text-zinc-350";
  const labelClass = "text-zinc-400 font-medium w-24 shrink-0";

  return (
    <div className="space-y-4">
      <CustomerTrackingBlock
        reservationId={reservation.id}
        reservationToken={reservation.reservationToken}
        copiedId={copiedId}
        copiedLink={copiedLink}
        handleCopyId={handleCopyId}
        handleCopyLink={handleCopyLink}
      />

      <div className="bg-zinc-50/20 dark:bg-zinc-950/10 p-4 rounded-xl border border-zinc-150/70 dark:border-zinc-800 space-y-3.5">
        <div className={rowClass}>
          <User className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span className={labelClass}>Client Name</span>
          <span className="font-semibold text-zinc-900 dark:text-white">
            {reservation.customer.firstName} {reservation.customer.lastName}
          </span>
        </div>
        <div className={rowClass}>
          <Mail className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span className={labelClass}>Email</span>
          <span className="font-medium truncate">{reservation.customer.email}</span>
        </div>
        <div className={rowClass}>
          <Phone className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span className={labelClass}>Phone</span>
          <span className="font-medium">{reservation.customer.phone || "Not given"}</span>
        </div>
        <div className={rowClass}>
          <Calendar className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span className={labelClass}>Date</span>
          <span className="font-semibold text-zinc-850 dark:text-zinc-200">
            {new Date(reservation.date).toDateString()}
          </span>
        </div>
        <div className={rowClass}>
          <Clock className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span className={labelClass}>Time Slot</span>
          <span className="font-medium">{reservation.startTime} - {reservation.endTime}</span>
        </div>
        <div className={rowClass}>
          <Tag className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
          <span className={labelClass}>Event Type</span>
          <span className="font-semibold text-zinc-850 dark:text-zinc-200">{reservation.eventType}</span>
        </div>
      </div>
    </div>
  );
}
