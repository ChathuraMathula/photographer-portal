import React from "react";
import { type TrackingReservation } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RemainingBalanceCardProps {
  reservation: TrackingReservation;
  onPayBalance: (remainingBalanceCents: number) => void;
}

export function RemainingBalanceCard({
  reservation,
  onPayBalance,
}: RemainingBalanceCardProps) {
  if (
    reservation.status !== "CONFIRMED" ||
    (reservation.totalAmountInCents ?? 0) <= (reservation.totalPaidInCents ?? 0)
  ) {
    return null;
  }

  const remainingBalanceCents =
    (reservation.totalAmountInCents ?? 0) - (reservation.totalPaidInCents ?? 0);
  const remainingBalanceLkr = (remainingBalanceCents / 100).toLocaleString();

  return (
    <Card className="border border-zinc-200/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">
          Complete Remaining Balance
        </CardTitle>
        <CardDescription className="text-xs">
          Your deposit was paid successfully. Please settle the remaining balance of{" "}
          <strong>LKR {remainingBalanceLkr}</strong>.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
          onClick={() => onPayBalance(remainingBalanceCents)}
        >
          Pay Remaining Balance (LKR {remainingBalanceLkr})
        </Button>
      </CardFooter>
    </Card>
  );
}
