import { type TrackingReservation } from "@/types";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { ExternalLink } from "lucide-react";

export function ReservationHeader({
  reservation,
}: {
  reservation: TrackingReservation;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm animate-in fade-in duration-300">
      <div>
        <h1 className="text-title-large text-primary-dark dark:text-white">
          Reservation Tracking
        </h1>
        <p className="text-[11px] font-mono text-zinc-450 dark:text-zinc-500 select-all mt-0.5">
          Reservation ID: {reservation.id}
        </p>
        <p className="text-body-small text-zinc-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>Photographer:</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {reservation.photographer.firstName}{" "}
            {reservation.photographer.lastName}
          </span>
          {reservation.photographer.bookingSlug && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <a
                href={`${typeof window !== "undefined" ? window.location.origin : ""}/book/${reservation.photographer.bookingSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Booking Page <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </p>
      </div>
      <StatusBadge
        status={reservation.status}
        paymentDeadline={reservation.paymentDeadline}
      />
    </header>
  );
}
