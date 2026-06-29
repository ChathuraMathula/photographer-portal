"use client";

import React from "react";
import { type DistrictStat } from "@/app/dashboard/reports/utils/locationUtils";

type Props = {
  data: DistrictStat[];
  eventTypes: string[];
};

const ET_COLORS: Record<string, string> = {
  Wedding: "#ec4899",
  Portrait: "#6366f1",
  Corporate: "#3b82f6",
  "Birthday Party": "#f59e0b",
  Graduation: "#10b981",
  Engagement: "#f97316",
  Maternity: "#8b5cf6",
  Other: "#a1a1aa",
};

function getColor(et: string, idx: number): string {
  if (ET_COLORS[et]) return ET_COLORS[et];
  const fallbacks = ["#14b8a6", "#e11d48", "#0ea5e9", "#a3e635", "#fb923c"];
  return fallbacks[idx % fallbacks.length];
}

const MAX_DISTRICTS = 8;

export function EventTypeByDistrictChart({ data, eventTypes }: Props) {
  if (!data || data.length === 0 || eventTypes.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-zinc-400 italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        No event type breakdown available
      </div>
    );
  }

  const sliced = data.slice(0, MAX_DISTRICTS);
  const maxCount = Math.max(...sliced.map((d) => d.count), 1);

  return (
    <div className="space-y-1">
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pb-3">
        {eventTypes.map((et, i) => (
          <span key={et} className="flex items-center gap-1 text-[10px] text-zinc-500">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: getColor(et, i) }}
            />
            {et}
          </span>
        ))}
      </div>

      {/* Stacked bars per district */}
      {sliced.map((d) => {
        return (
          <div key={d.district} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 w-28 shrink-0 truncate text-right">
              {d.district}
            </span>
            <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden flex">
              {eventTypes.map((et, i) => {
                const count = d.eventTypes[et] || 0;
                if (count === 0) return null;
                const pct = (count / maxCount) * 100;
                return (
                  <div
                    key={et}
                    title={`${et}: ${count}`}
                    className="h-full transition-all duration-500 flex items-center justify-center"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getColor(et, i),
                    }}
                  >
                    {pct > 8 && (
                      <span className="text-[9px] text-white font-bold">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] text-zinc-400 w-6 text-right shrink-0">{d.count}</span>
          </div>
        );
      })}
    </div>
  );
}
