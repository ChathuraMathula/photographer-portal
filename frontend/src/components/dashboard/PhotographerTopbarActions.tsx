import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarCheck } from "lucide-react";
import { AcceptBookingsConfirmModal } from "./AcceptBookingsConfirmModal";

type Props = {
  showAcceptBookingsInTopbar: boolean;
  showManualBookingInTopbar: boolean;
  profileAvailability: boolean;
  onToggleAvailability: () => void;
  onAddManualBooking: () => void;
};

export function PhotographerTopbarActions({
  showAcceptBookingsInTopbar,
  showManualBookingInTopbar,
  profileAvailability,
  onToggleAvailability,
  onAddManualBooking,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!showAcceptBookingsInTopbar && !showManualBookingInTopbar) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
      {showAcceptBookingsInTopbar && (
        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-1 pr-2 pl-3 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 shadow-sm">
          <CalendarCheck className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
          <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mr-1 hidden sm:block">
            Accepting:
          </span>
          <button
            onClick={() => {
              if (profileAvailability) {
                setShowConfirmModal(true);
              } else {
                onToggleAvailability();
              }
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              profileAvailability ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
            aria-label="Toggle bookings"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                profileAvailability ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      {showManualBookingInTopbar && (
        <Button
          onClick={onAddManualBooking}
          size="sm"
          variant="outline"
          className="h-8 px-2.5 sm:px-3 text-xs shadow-sm bg-white hover:bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Add Booking</span>
        </Button>
      )}

      <AcceptBookingsConfirmModal
        open={showConfirmModal}
        onConfirm={() => {
          setShowConfirmModal(false);
          onToggleAvailability();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
