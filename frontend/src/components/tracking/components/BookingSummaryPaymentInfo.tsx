import { type TrackingReservation } from "@/types";

export function BookingSummaryPaymentInfo({
  reservation,
}: {
  reservation: TrackingReservation;
}) {
  if (reservation.status !== "CONFIRMED" && reservation.status !== "COMPLETED")
    return null;
  if (!reservation.totalAmountInCents) return null;

  return (
    <div className="sm:col-span-2 border-t pt-4 mt-2 dark:border-zinc-800 animate-in fade-in duration-300">
      <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Payment Summary
      </p>
      <div className="grid grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase">
            Total Price
          </p>
          <p className="font-bold text-zinc-950 dark:text-white mt-0.5">
            LKR {((reservation.totalAmountInCents || 0) / 100).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase">
            Deposit Paid
          </p>
          <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            LKR{" "}
            {(
              (reservation.advancePaymentPriceInCents || 0) / 100
            ).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 font-semibold uppercase">
            Balance Due
          </p>
          <p className="font-bold text-zinc-950 dark:text-white mt-0.5">
            LKR{" "}
            {(
              ((reservation.totalAmountInCents || 0) -
                (reservation.advancePaymentPriceInCents || 0)) /
              100
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
