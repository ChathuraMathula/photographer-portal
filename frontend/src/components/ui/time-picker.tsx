"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  label?: string;
  value: string; // "HH:mm" 24h format
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function TimePicker({
  label,
  value,
  onChange,
  disabled = false,
  className,
}: TimePickerProps) {
  const [hour, minute] = value ? value.split(":") : ["09", "00"];

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}:${minute || "00"}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${hour || "09"}:${e.target.value}`);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5 p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-xs focus-within:ring-2 focus-within:ring-[#0e2d5c]">
        <Clock className="h-4 w-4 text-zinc-400 shrink-0 ml-1" />
        
        {/* Hour Select */}
        <select
          value={hour}
          disabled={disabled}
          onChange={handleHourChange}
          className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white border-none focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {HOURS.map((h) => (
            <option key={h} value={h} className="bg-white dark:bg-zinc-900">
              {h}:00 ({parseInt(h, 10) >= 12 ? (parseInt(h, 10) === 12 ? '12 PM' : `${parseInt(h, 10) - 12} PM`) : parseInt(h, 10) === 0 ? '12 AM' : `${parseInt(h, 10)} AM`})
            </option>
          ))}
        </select>

        <span className="text-zinc-400 font-bold text-xs">:</span>

        {/* Minute Select */}
        <select
          value={minute}
          disabled={disabled}
          onChange={handleMinuteChange}
          className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white border-none focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m} className="bg-white dark:bg-zinc-900">
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
