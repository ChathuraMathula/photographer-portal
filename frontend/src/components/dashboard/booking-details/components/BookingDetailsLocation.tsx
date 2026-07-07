"use client";

import React from "react";
import { type Reservation } from "@/types";
import { MapPin } from "lucide-react";
import { OSMMapPreview } from "@/components/common/OSMMapPreview";

interface LocationProps {
  reservation: Reservation;
}

export function BookingDetailsLocation({ reservation }: LocationProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <MapPin className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
        <div className="text-left">
          <span className="text-[11px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Location Address
          </span>
          <p className="text-body-small text-zinc-700 dark:text-zinc-300 mt-0.5 leading-normal">
            {reservation.location || "Online / Not specified"}
          </p>
        </div>
      </div>
      
      {(reservation.location || reservation.locationMapLink || reservation.city || reservation.district) && (
        <div className="mt-3.5">
          <p className="text-body-caption font-semibold text-zinc-400 mb-2">Location Map Preview</p>
          <OSMMapPreview
            location={reservation.location}
            city={reservation.city}
            district={reservation.district}
            locationMapLink={reservation.locationMapLink}
            height="180px"
          />
        </div>
      )}
    </div>
  );
}
