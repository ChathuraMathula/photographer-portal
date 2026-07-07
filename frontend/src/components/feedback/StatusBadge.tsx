import { type ReservationStatus } from "@/types";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const statusConfig: Record<
  ReservationStatus,
  { label: string; className: string; Icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending Review",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    Icon: Clock,
  },
  PROPOSED: {
    label: "Proposal Proposed",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    Icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Unavailable",
    className:
      "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
    Icon: XCircle,
  },
  CANCELLED: {
    label: "Expired / Cancelled",
    className:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    Icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
};

export function StatusBadge({ status, paymentDeadline }: { status: ReservationStatus; paymentDeadline?: string }) {
  const isExpired = status === "PROPOSED" && paymentDeadline && new Date(paymentDeadline) < new Date();
  const cfg = isExpired
    ? {
        label: "Expired",
        className: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
        Icon: XCircle,
      }
    : statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body-caption font-semibold ${cfg.className}`}
    >
      <cfg.Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

/** Compact pill for use inside tables / lists */
export function StatusPill({ status, paymentDeadline }: { status: ReservationStatus; paymentDeadline?: string }) {
  const isExpired = status === "PROPOSED" && paymentDeadline && new Date(paymentDeadline) < new Date();
  
  if (isExpired) {
    return (
      <span className="rounded-full px-2 py-0.5 text-body-caption font-medium uppercase bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400">
        EXPIRED
      </span>
    );
  }

  const map: Record<ReservationStatus, string> = {
    PENDING:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400",
    PROPOSED:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400",
    CONFIRMED:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400",
    REJECTED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    CANCELLED:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    COMPLETED:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-body-caption font-medium uppercase ${map[status]}`}
    >
      {status}
    </span>
  );
}
