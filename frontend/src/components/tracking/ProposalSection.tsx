import { useState } from "react";
import { type TrackingReservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { ProposalPackageCard } from "./ProposalPackageCard";
import { CountdownTimer } from "./CountdownTimer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  reservation: TrackingReservation;
  selectedPkgId: string | null;
  confirming: boolean;
  onSelectPackage: (id: string) => void;
  onConfirm: () => void;
  getDeadlineText: (deadline?: string) => string;
  onCancel: () => void;
  cancelling: boolean;
};

export function ProposalSection({
  reservation,
  selectedPkgId,
  confirming,
  onSelectPackage,
  onConfirm,
  getDeadlineText,
  onCancel,
  cancelling,
}: Props) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  if (!reservation.selectedPackages) return null;
  if (reservation.status !== "PROPOSED" && reservation.status !== "CONFIRMED") return null;

  const getActiveDeposit = () => {
    if (!selectedPkgId || !reservation.selectedPackages) {
      return reservation.advancePaymentPriceInCents ?? 0;
    }
    const pkg = reservation.selectedPackages.find((p) => p.id === selectedPkgId);
    if (!pkg) return reservation.advancePaymentPriceInCents ?? 0;
    if (pkg.customDepositAmountInCents !== undefined && pkg.customDepositAmountInCents !== null) {
      return pkg.customDepositAmountInCents;
    }
    if (pkg.depositType === "fixed") {
      return pkg.depositValue ?? 0;
    }
    if (pkg.depositType === "percentage") {
      return Math.round((pkg.priceInCents * (pkg.depositValue ?? 0)) / 100);
    }
    return reservation.advancePaymentPriceInCents ?? 0;
  };

  const isExpired =
    reservation.status === "PROPOSED" &&
    reservation.paymentDeadline &&
    new Date(reservation.paymentDeadline) < new Date();

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Photographer Proposal</CardTitle>
        {reservation.status === "PROPOSED" && reservation.paymentDeadline && (
          <div className="pt-2">
            <CountdownTimer deadline={reservation.paymentDeadline} />
          </div>
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
              isConfirmed={reservation.status === "CONFIRMED" || !!isExpired}
              isMySelection={
                reservation.status === "CONFIRMED" &&
                reservation.clientSelectedPackageId === pkg.id
              }
              onSelect={onSelectPackage}
            />
          ))}
        </div>

        {reservation.status === "PROPOSED" && isExpired && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-center">
            <p className="text-red-655 dark:text-red-400 font-semibold text-body-small">
              ⚠️ This proposal has expired. You can no longer select packages or make payments for this reservation request.
            </p>
          </div>
        )}

        {reservation.status === "PROPOSED" && !isExpired && selectedPkgId && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 p-4 rounded-xl">
              <div>
                <p className="text-body-caption text-zinc-550">Required Advance Deposit</p>
                <p className="text-title-medium text-primary-dark dark:text-white mt-0.5">
                  LKR{" "}
                  {(getActiveDeposit() / 100).toLocaleString()}
                </p>
              </div>
              <Button
                disabled={!selectedPkgId}
                onClick={onConfirm}
                className="w-full sm:w-auto bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 h-11 px-6 rounded-xl font-semibold shadow-md transition-all cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Select Package &amp; Pay Deposit
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

        {reservation.status === "PROPOSED" && !isExpired && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center text-body-caption">
            <span className="text-zinc-550">No longer need this booking?</span>
            <Button
              type="button"
              variant="outline"
              disabled={cancelling}
              onClick={() => setShowCancelConfirm(true)}
              className="text-red-500 border-red-200 dark:border-zinc-850 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs px-3 h-8 cursor-pointer"
            >
              {cancelling ? "Cancelling..." : "Cancel Reservation"}
            </Button>
          </div>
        )}
      </CardContent>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-1">
              <AlertTriangle className="h-5 w-5 text-red-650" />
            </div>
            <AlertDialogTitle className="text-title-base text-zinc-900">
              Cancel Reservation Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
              Are you sure you want to cancel this reservation request? This action will release the locked time slot and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowCancelConfirm(false);
                onCancel();
              }}
              className="btn btn-danger btn-modal text-body-small-s h-11 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm transition-all"
            >
              Yes, cancel
            </button>
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              className="btn btn-outline btn-modal text-body-small-s h-11 cursor-pointer border border-zinc-200 hover:bg-zinc-50 rounded-xl font-medium transition-all"
            >
              No
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
