"use client";

import React from "react";
import { type CityStat } from "@/app/dashboard/reports/utils/locationUtils";

type Props = {
  data: CityStat[];
};

const RANK_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];
const MAX_CITIES = 8;

export function CityBookingsRank({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-zinc-400 italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        No city data available
      </div>
    );
  }

  const sliced = data.slice(0, MAX_CITIES);
  const maxCount = Math.max(...sliced.map((c) => c.count), 1);

  return (
    <div className="space-y-2">
      {sliced.map((c, i) => {
        const color = RANK_COLORS[i] || "#a1a1aa";
        const fillPct = (c.count / maxCount) * 100;

        return (
          <div key={c.city} className="flex items-center gap-2.5">
            {/* Rank badge */}
            <span
              className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </span>

            {/* City name + mini progress bar */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center text-xs mb-0.5">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {c.city}
                </span>
                <span className="text-zinc-500 font-medium ml-2 shrink-0">
                  {c.count}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${fillPct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
