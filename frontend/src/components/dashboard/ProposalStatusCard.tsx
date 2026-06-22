import { type Reservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProposalStatusCard({ reservation }: { reservation: Reservation }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">Proposal Status Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-body-small pt-4 space-y-2">
        <p className="text-zinc-650 dark:text-zinc-400">
          <strong className="text-zinc-800 dark:text-zinc-200">Status:</strong>{" "}
          <span className="font-semibold text-primary-light dark:text-indigo-400 uppercase">
            {reservation.status}
          </span>
        </p>
        <p className="text-zinc-655 dark:text-zinc-400">
          <strong className="text-zinc-800 dark:text-zinc-200">Advance Requested:</strong> LKR{" "}
          {((reservation.advancePaymentPriceInCents ?? 0) / 100).toLocaleString()}
        </p>
        {reservation.status === "PROPOSED" && reservation.paymentDeadline && (
          <p className="text-red-650 dark:text-red-400 text-body-caption font-semibold mt-1">
            ⏰ Expiry Deadline:{" "}
            {new Date(reservation.paymentDeadline).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
