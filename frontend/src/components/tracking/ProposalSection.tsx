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
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Photographer Proposal</CardTitle>
        {reservation.status === "PROPOSED" && (
          <CardDescription className="flex items-center gap-1.5 text-red-650 dark:text-red-400 text-body-small-s font-semibold">
            <Clock className="h-4 w-4 animate-pulse shrink-0" />
            Slot locked: {getDeadlineText(reservation.paymentDeadline)}
          </CardDescription>
        )}
        {reservation.quotationNotes && (
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 p-4 rounded-xl text-body-small italic text-zinc-650 dark:text-zinc-300 mt-3">
            <strong>Photographer&apos;s notes:</strong> &quot;{reservation.quotationNotes}&quot;
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-body-small-s font-semibold text-zinc-900 dark:text-white">
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
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 p-4 rounded-xl">
              <div>
                <p className="text-body-caption text-zinc-550">Required Advance Deposit</p>
                <p className="text-title-medium text-primary-dark dark:text-white mt-0.5">
                  LKR{" "}
                  {(
                    (reservation.advancePaymentPriceInCents ?? 0) / 100
                  ).toLocaleString()}
                </p>
              </div>
              <Button
                disabled={!selectedPkgId || confirming}
                onClick={onConfirm}
                className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-6 shrink-0 shadow-sm"
              >
                {confirming ? "Processing..." : "Select Package & Confirm"}
              </Button>
            </div>
          </div>
        )}

        {reservation.status === "CONFIRMED" && (
          <div className="bg-emerald-50 border border-emerald-250/20 p-4 rounded-xl text-emerald-950 dark:bg-emerald-950/10 dark:border-emerald-900/50 dark:text-emerald-400 text-body-small">
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
