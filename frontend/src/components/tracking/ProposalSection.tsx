import { type TrackingReservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ProposalPackageCard } from "./ProposalPackageCard";

type Props = {
  reservation: TrackingReservation;
  selectedPkgId: string | null;
  confirming: boolean;
  onSelectPackage: (id: string) => void;
  onConfirm: () => void;
  getDeadlineText: (deadline?: string) => string;
};

export function ProposalSection({
  reservation,
  selectedPkgId,
  confirming,
  onSelectPackage,
  onConfirm,
  getDeadlineText,
}: Props) {
  if (!reservation.selectedPackages) return null;
  if (reservation.status !== "PROPOSED" && reservation.status !== "CONFIRMED") return null;

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Photographer Proposal</CardTitle>
        {reservation.status === "PROPOSED" && (
          <CardDescription className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
            <Clock className="h-4 w-4 animate-pulse" />
            Slot locked: {getDeadlineText(reservation.paymentDeadline)}
          </CardDescription>
        )}
        {reservation.quotationNotes && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg text-sm italic text-zinc-600 dark:text-zinc-300 mt-2">
            <strong>Photographer&apos;s notes:</strong> &quot;{reservation.quotationNotes}&quot;
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Recommended Packages:
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {reservation.selectedPackages!.map((pkg) => (
            <ProposalPackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={selectedPkgId === pkg.id}
              isConfirmed={reservation.status === "CONFIRMED"}
              isMySelection={
                reservation.status === "CONFIRMED" &&
                reservation.clientSelectedPackageId === pkg.id
              }
              onSelect={onSelectPackage}
            />
          ))}
        </div>

        {reservation.status === "PROPOSED" && (
          <div className="border-t pt-4 space-y-3 dark:border-zinc-800">
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-lg">
              <div>
                <p className="text-xs text-zinc-500">Required Advance Deposit</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  LKR{" "}
                  {(
                    (reservation.advancePaymentPriceInCents ?? 0) / 100
                  ).toLocaleString()}
                </p>
              </div>
              <Button
                disabled={!selectedPkgId || confirming}
                onClick={onConfirm}
                className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {confirming ? "Processing..." : "Select Package & Confirm"}
              </Button>
            </div>
          </div>
        )}

        {reservation.status === "CONFIRMED" && (
          <div className="bg-emerald-50 border border-emerald-200/50 p-4 rounded-lg text-emerald-950 dark:bg-emerald-950/10 dark:border-emerald-900/50 dark:text-emerald-400 text-sm">
            ✨ Reservation Confirmed. Deposit of LKR{" "}
            {(
              (reservation.advancePaymentPriceInCents ?? 0) / 100
            ).toLocaleString()}{" "}
            has been simulated/paid. The photographer is booked.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
