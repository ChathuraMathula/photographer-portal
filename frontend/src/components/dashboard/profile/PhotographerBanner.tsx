import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AcceptBookingsConfirmModal } from "@/components/modals/AcceptBookingsConfirmModal";

type Props = {
  firstName: string;
  profileAvailability: boolean;
  onToggleAvailability: () => void;
  onAddManualBooking: () => void;
};

export function PhotographerBanner({
  firstName,
  profileAvailability,
  onToggleAvailability,
  onAddManualBooking,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative">
      <div>
        <h2 className="text-title-large text-primary-dark dark:text-white">
          Welcome back, {firstName}
        </h2>
        <p className="text-body-small text-zinc-500 mt-1">
          Manage your reservations, packages and profile below.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-body-small-s font-semibold text-zinc-550 dark:text-zinc-400">
            Accepting bookings:
          </span>
          <button
            onClick={() => {
              if (profileAvailability) {
                setShowConfirmModal(true);
              } else {
                onToggleAvailability();
              }
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              profileAvailability
                ? "bg-emerald-500"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                profileAvailability ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <Button
          onClick={onAddManualBooking}
          variant="outline"
          className="btn btn-secondary h-10 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s shadow-sm gap-1.5"
        >
          <Plus className="h-4 w-4 shrink-0" /> Add Manual Booking
        </Button>
      </div>

      <AcceptBookingsConfirmModal
        open={showConfirmModal}
        onConfirm={() => {
          setShowConfirmModal(false);
          onToggleAvailability();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </header>
  );
}
