"use client";

import React from "react";
import { type Reservation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomerDetails } from "./customer-details/hooks/useCustomerDetails";
import { CustomerHeader } from "./customer-details/components/CustomerHeader";
import { CustomerTrackingBlock } from "./customer-details/components/CustomerTrackingBlock";
import { CustomerBioSection } from "./customer-details/components/CustomerBioSection";
import { CustomerLocationSection } from "./customer-details/components/CustomerLocationSection";

export function CustomerDetailsCard({ reservation }: { reservation: Reservation }) {
  const { copiedId, copiedLink, handleCopyId, handleCopyLink } = useCustomerDetails(
    reservation.id,
    reservation.reservationToken || ""
  );

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CustomerHeader date={reservation.date} />
      
      <CardContent className="space-y-4 pt-4 text-body-small text-zinc-655 dark:text-zinc-450">
        <CustomerTrackingBlock
          reservationId={reservation.id}
          reservationToken={reservation.reservationToken}
          copiedId={copiedId}
          copiedLink={copiedLink}
          handleCopyId={handleCopyId}
          handleCopyLink={handleCopyLink}
        />

        <CustomerBioSection
          customer={reservation.customer}
          customerNotes={reservation.customerNotes}
        />

        <CustomerLocationSection
          startTime={reservation.startTime}
          endTime={reservation.endTime}
          eventType={reservation.eventType}
          location={reservation.location}
          locationMapLink={reservation.locationMapLink}
          city={reservation.city}
          district={reservation.district}
        />
      </CardContent>
    </Card>
  );
}
