import { type Reservation } from "@/types";
import { StatusPill } from "@/components/feedback/StatusBadge";

type Props = {
  reservation: Reservation;
  isSelected: boolean;
  onSelect: (res: Reservation) => void;
};

export function ReservationListItem({ reservation: res, isSelected, onSelect }: Props) {
  const getUnreadCount = () => {
    if (!res.messages || res.messages.length === 0) return 0;
    const key = `chat_last_viewed_photographer_${res.id}`;
    const lastViewed = localStorage.getItem(key) || new Date(0).toISOString();
    return res.messages.filter(
      (msg) =>
        msg.sender === "CUSTOMER" &&
        new Date(msg.timestamp).getTime() > new Date(lastViewed).getTime()
    ).length;
  };

  const unreadCount = isSelected ? 0 : getUnreadCount();

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
        <span className="text-body-small-s font-semibold text-zinc-950 dark:text-white truncate flex items-center gap-2">
          {res.customer?.firstName ?? ""} {res.customer?.lastName ?? "Customer"}
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-body-caption font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </span>
        <span className="text-body-caption text-zinc-400 shrink-0">
          {new Date(res.date).toISOString().split("T")[0]}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-body-caption text-zinc-500">{res.eventType}</span>
        <StatusPill status={res.status} paymentDeadline={res.paymentDeadline} />
      </div>
    </div>
  );
}
