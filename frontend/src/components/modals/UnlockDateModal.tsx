"use client";

import React, { useState } from "react";
import { ModalLayout } from "./ModalLayout";
import { Button } from "@/components/ui/button";
import { Unlock, Calendar as CalendarIcon, Clock, Trash2 } from "lucide-react";
import { type LockedDate } from "@/types";

type UnlockDateModalProps = {
  isOpen: boolean;
  date: Date | null;
  lockedSlots: LockedDate[];
  onClose: () => void;
  onConfirmUnlock: (lockedDateId: string) => Promise<void>;
};

export function UnlockDateModal({
  isOpen,
  date,
  lockedSlots,
  onClose,
  onConfirmUnlock,
}: UnlockDateModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!isOpen || !date) return null;

  const formattedDisplayDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleUnlock = async (id: string) => {
    try {
      setError("");
      setLoadingId(id);
      await onConfirmUnlock(id);
      if (lockedSlots.length <= 1) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to unlock date.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <ModalLayout
      title="Unlock Date & Time Slot"
      onClose={onClose}
      asForm={false}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Date Header */}
        <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white">
          <CalendarIcon className="h-5 w-5 shrink-0 text-[#0e2d5c] dark:text-blue-400" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Selected Date
            </div>
            <div className="text-sm font-bold">{formattedDisplayDate}</div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Unlocking this date will delete the lock record and re-enable public booking availability for the specified time slot.
        </p>

        {/* List of Locked Slots for this Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Active Locked Time Slots
          </label>
          {lockedSlots.length === 0 ? (
            <div className="text-xs text-zinc-500 italic p-3 text-center">
              No locked slots found for this date.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lockedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {slot.startTime === "00:00" && slot.endTime === "23:59"
                        ? "Full Day (00:00 - 23:59)"
                        : `${slot.startTime} - ${slot.endTime}`}
                    </div>
                    {slot.reason && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        Reason: {slot.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loadingId === slot.id}
                    onClick={() => handleUnlock(slot.id)}
                    className="h-8 text-xs border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 gap-1"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    {loadingId === slot.id ? "Unlocking..." : "Unlock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
