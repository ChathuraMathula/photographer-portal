import React, { useState } from "react";
import { AcceptBookingsConfirmModal } from "@/components/modals/AcceptBookingsConfirmModal";

type Props = {
  profileAvailability: boolean;
  onToggleAvailability: () => void;
};

export function AcceptBookingsToggle({
  profileAvailability,
  onToggleAvailability,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-2xl">
        <div className="space-y-1">
          <p className="text-body-small-s font-bold text-zinc-900 dark:text-white">
            Accepting Bookings
          </p>
          <p className="text-[11px] text-zinc-500">
            Toggle your availability to pause or resume incoming requests.
          </p>
        </div>
        <button
          type="button"
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
              : "bg-zinc-300 dark:bg-zinc-600"
          }`}
          aria-label="Toggle bookings"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              profileAvailability ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      <AcceptBookingsConfirmModal
        open={showConfirmModal}
        onConfirm={() => {
          setShowConfirmModal(false);
          onToggleAvailability();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
