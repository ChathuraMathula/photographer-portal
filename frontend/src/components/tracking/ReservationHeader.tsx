import { type TrackingReservation } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";

export function ReservationHeader({ reservation }: { reservation: TrackingReservation }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <div>
        <h1 className="text-title-large text-primary-dark dark:text-white">
          Reservation Tracking
        </h1>
        <p className="text-body-small text-zinc-500 mt-1">
          Photographer:{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {reservation.photographer.firstName} {reservation.photographer.lastName}
          </span>
        </p>
      </div>
      <StatusBadge status={reservation.status} />
    </header>
  );
}
