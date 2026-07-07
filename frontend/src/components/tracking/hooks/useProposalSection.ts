import { type TrackingReservation } from "@/types";

export function useProposalSection(
  reservation: TrackingReservation,
  selectedPkgId: string | null,
) {
  const getActiveDeposit = () => {
    if (!selectedPkgId || !reservation.selectedPackages)
      return reservation.advancePaymentPriceInCents ?? 0;
    const pkg = reservation.selectedPackages.find(
      (p) => p.id === selectedPkgId,
    );
    if (!pkg) return reservation.advancePaymentPriceInCents ?? 0;
    if (
      pkg.customDepositAmountInCents !== undefined &&
      pkg.customDepositAmountInCents !== null
    ) {
      return pkg.customDepositAmountInCents;
    }
    if (pkg.depositType === "fixed") return pkg.depositValue ?? 0;
    if (pkg.depositType === "percentage")
      return Math.round((pkg.priceInCents * (pkg.depositValue ?? 0)) / 100);
    return reservation.advancePaymentPriceInCents ?? 0;
  };

  const isExpired =
    reservation.status === "PROPOSED" &&
    reservation.paymentDeadline &&
    new Date(reservation.paymentDeadline) < new Date();

  return { getActiveDeposit, isExpired };
}
