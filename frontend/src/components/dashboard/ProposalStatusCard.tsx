import { type Reservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProposalStatusCard({ reservation }: { reservation: Reservation }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Proposal Status Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p>
          <strong>Status:</strong>{" "}
          <span className="font-semibold text-indigo-500 uppercase">
            {reservation.status}
          </span>
        </p>
        <p>
          <strong>Advance Requested:</strong> LKR{" "}
          {((reservation.advancePaymentPriceInCents ?? 0) / 100).toLocaleString()}
        </p>
        {reservation.status === "PROPOSED" && reservation.paymentDeadline && (
          <p className="text-red-500 text-xs">
            ⏰ Expiry Deadline:{" "}
            {new Date(reservation.paymentDeadline).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
