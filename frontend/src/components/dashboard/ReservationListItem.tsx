import { type Reservation } from "@/types";
import { StatusPill } from "@/components/common/StatusBadge";

type Props = {
  reservation: Reservation;
  isSelected: boolean;
  onSelect: (res: Reservation) => void;
};

export function ReservationListItem({ reservation: res, isSelected, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(res)}
      className={`p-4 cursor-pointer text-left transition-colors ${
        isSelected
          ? "bg-zinc-50 dark:bg-zinc-900/50 border-l-4 border-primary-dark dark:border-white"
          : "hover:bg-zinc-50/50"
      }`}
    >
      <div className="flex justify-between items-start gap-1">
        <span className="text-body-small-s font-semibold text-zinc-950 dark:text-white truncate">
          {res.customer.firstName} {res.customer.lastName}
        </span>
        <span className="text-body-caption text-zinc-400 shrink-0">
          {new Date(res.date).toISOString().split("T")[0]}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-body-caption text-zinc-500">{res.eventType}</span>
        <StatusPill status={res.status} />
      </div>
    </div>
  );
}
