"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Lock, Unlock, Clock, CalendarDays, CheckCircle2, ShieldAlert } from "lucide-react";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { usePhotographerDashboardContext } from "@/app/dashboard/context/PhotographerDashboardContext";
import { UnlockDateModal } from "@/components/modals/UnlockDateModal";
import { type LockedDate } from "@/types";
import { toast } from "sonner";

export function ProfileCalendarLockCard() {
  const context = usePhotographerDashboardContext();

  const [mode, setMode] = useState<"single" | "range">("single");
  const [selectedSingleDate, setSelectedSingleDate] = useState<Date | null>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: new Date(),
    to: undefined,
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [reason, setReason] = useState("");
  const [locking, setLocking] = useState(false);

  // Unlock modal state
  const [selectedUnlockDay, setSelectedUnlockDay] = useState<Date | null>(null);
  const [selectedUnlockSlots, setSelectedUnlockSlots] = useState<LockedDate[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  if (!context) return null;

  const { lockedDates, fetchLockedDates, lockDate, unlockDate } = context;

  useEffect(() => {
    fetchLockedDates();
  }, []);

  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const getSelectedDatesList = (): Date[] => {
    if (mode === "single") {
      return selectedSingleDate ? [selectedSingleDate] : [];
    } else {
      if (!selectedRange.from) return [];
      if (!selectedRange.to) return [selectedRange.from];

      const dates: Date[] = [];
      const curr = new Date(selectedRange.from);
      const end = new Date(selectedRange.to);

      while (curr.getTime() <= end.getTime()) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    }
  };

  const selectedDatesList = getSelectedDatesList();

  const handleConfirmBatchLock = async () => {
    if (selectedDatesList.length === 0) return;

    const sTime = isFullDay ? "00:00" : startTime;
    const eTime = isFullDay ? "23:59" : endTime;

    if (!isFullDay && sTime >= eTime) {
      toast.error("Start time must be earlier than end time.");
      return;
    }

    try {
      setLocking(true);
      for (const d of selectedDatesList) {
        await lockDate({
          date: toIso(d),
          startTime: sTime,
          endTime: eTime,
          reason: reason.trim() || undefined,
        });
      }
      toast.success(
        `Successfully locked ${selectedDatesList.length} date(s)!`,
      );
      setShowConfigModal(false);
      setReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to lock date(s)");
    } finally {
      setLocking(false);
    }
  };

  const handleDayClick = (day: Date, dayLocks: LockedDate[]) => {
    if (dayLocks.length > 0) {
      setSelectedUnlockDay(day);
      setSelectedUnlockSlots(dayLocks);
      setShowUnlockModal(true);
    }
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              Calendar & Date Locks
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Select single dates or date ranges to lock availability for public clients in real-time.
            </CardDescription>
          </div>

          {/* Mode Switch Button Group */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                mode === "single"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Single Date
            </button>
            <button
              type="button"
              onClick={() => setMode("range")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                mode === "range"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Date Range
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Calendar UI */}
          <div className="w-full lg:w-auto flex justify-center overflow-x-auto">
            {mode === "single" ? (
              <Calendar
                mode="single"
                selected={selectedSingleDate}
                onSelect={(d) => setSelectedSingleDate(d)}
                lockedDates={lockedDates}
                onDayClick={handleDayClick}
              />
            ) : (
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={(r) => setSelectedRange(r || { from: undefined, to: undefined })}
                lockedDates={lockedDates}
                onDayClick={handleDayClick}
              />
            )}
          </div>

          {/* Controls & Summary Side Panel */}
          <div className="flex-1 w-full space-y-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Current Selection Summary
              </div>

              {selectedDatesList.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">
                  Click on the calendar to pick a date or range to lock.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">
                    {mode === "single"
                      ? selectedSingleDate?.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : selectedRange.from && selectedRange.to
                        ? `${selectedRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${selectedRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : selectedRange.from?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {selectedDatesList.length} date(s) selected
                  </div>
                </div>
              )}

              <Button
                type="button"
                disabled={selectedDatesList.length === 0}
                onClick={() => setShowConfigModal(true)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Lock className="h-4 w-4" />
                Lock Selected Date(s) ({selectedDatesList.length})
              </Button>
            </div>

            {/* Locked Dates Count Note */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200/60 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{lockedDates.length} locked date record(s) active</span>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                Real-time
              </span>
            </div>
          </div>
        </div>

        {/* Lock Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600" />
                Lock {selectedDatesList.length} Date(s)
              </h3>

              <p className="text-xs text-zinc-500">
                Choose the time slot to block for the selected date(s).
              </p>

              {/* Time Slot Option */}
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
                    Full Day (00:00-23:59)
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

              {/* Shadcn TimePickers */}
              {!isFullDay && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in duration-150">
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                  />
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Reason / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Personal day off, Vacation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0e2d5c]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-150 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfigModal(false)}
                  disabled={locking}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmBatchLock}
                  disabled={locking}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" />
                  {locking ? "Locking..." : "Confirm & Lock"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Unlock Confirmation Modal */}
        <UnlockDateModal
          isOpen={showUnlockModal}
          date={selectedUnlockDay}
          lockedSlots={selectedUnlockSlots}
          onClose={() => setShowUnlockModal(false)}
          onConfirmUnlock={async (id) => {
            await unlockDate(id);
            setSelectedUnlockSlots((prev) => prev.filter((s) => s.id !== id));
          }}
        />
      </CardContent>
    </Card>
  );
}
