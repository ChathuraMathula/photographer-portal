"use client";

import React, { useState } from "react";
import { ModalLayout } from "./ModalLayout";
import { Button } from "@/components/ui/button";
import { Lock, Clock, Calendar as CalendarIcon, Info } from "lucide-react";

type LockDateModalProps = {
  isOpen: boolean;
  date: Date | null;
  onClose: () => void;
  onConfirm: (data: {
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
  }) => Promise<void>;
};

export function LockDateModal({
  isOpen,
  date,
  onClose,
  onConfirm,
}: LockDateModalProps) {
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayStr = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${dayStr}`;

  const formattedDisplayDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const sTime = isFullDay ? "00:00" : startTime;
    const eTime = isFullDay ? "23:59" : endTime;

    if (!isFullDay && sTime >= eTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    try {
      setLoading(true);
      await onConfirm({
        date: formattedDate,
        startTime: sTime,
        endTime: eTime,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to lock date.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalLayout
      title="Lock Date & Time Slot"
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Date Display */}
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-900 dark:text-amber-300">
          <CalendarIcon className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Selected Date
            </div>
            <div className="text-sm font-bold">{formattedDisplayDate}</div>
          </div>
        </div>

        {/* Info Note */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Locking a date prevents public clients from requesting bookings for the specified time slot. Existing reservations and manual bookings will remain intact.
        </p>

        {/* Time Slot Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Time Slot Option
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsFullDay(true);
                setStartTime("00:00");
                setEndTime("23:59");
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                isFullDay
                  ? "border-[#0e2d5c] bg-[#0e2d5c]/10 text-[#0e2d5c] dark:border-white dark:bg-white/10 dark:text-white"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Full Day (All Day)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFullDay(false);
                if (startTime === "00:00" && endTime === "23:59") {
                  setStartTime("09:00");
                  setEndTime("17:00");
                }
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                !isFullDay
                  ? "border-[#0e2d5c] bg-[#0e2d5c]/10 text-[#0e2d5c] dark:border-white dark:bg-white/10 dark:text-white"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Custom Time Slot
            </button>
          </div>
        </div>

        {/* Custom Start/End Inputs */}
        {!isFullDay && (
          <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0e2d5c]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0e2d5c]"
                required
              />
            </div>
          </div>
        )}

        {/* Optional Reason */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Reason / Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Personal day off, Equipment maintenance"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0e2d5c]"
          />
        </div>

        {error && (
          <div className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" />
            {loading ? "Locking..." : "Confirm & Lock Date"}
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}
