import React from "react";
import { type TrackingReservation } from "@/types";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface FullyPaidCardProps {
  reservation: TrackingReservation;
  token: string;
}

export function FullyPaidCard({ reservation, token }: FullyPaidCardProps) {
  if (
    reservation.status !== "CONFIRMED" ||
    (reservation.totalPaidInCents ?? 0) < (reservation.totalAmountInCents ?? 1)
  ) {
    return null;
  }

  return (
    <Card className="border border-green-200/50 shadow-sm rounded-xl overflow-hidden bg-green-50/10 dark:bg-green-950/10">
      <CardHeader>
        <CardTitle className="text-body-base-bold font-bold text-green-700 dark:text-green-400">
          Booking Fully Paid
        </CardTitle>
        <CardDescription className="text-xs">
          All payments for this reservation are completed. You can download your official
          system-generated invoice below.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href={`${API}/invoices/public/${token}/download`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-body-caption font-bold shadow-md cursor-pointer transition-all"
        >
          Download PDF Invoice
        </a>
      </CardFooter>
    </Card>
  );
}
