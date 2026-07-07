"use client";
import React, { useState } from "react";
import { type DistrictStat } from "@/app/dashboard/reports/utils/locationUtils";

const MAX_BARS = 10;
const SEGMENT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

export function DistrictBookingsBar({ data }: { data: DistrictStat[] }) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  if (!data || data.length === 0) return (
    <div className="h-40 flex items-center justify-center text-xs text-zinc-400 italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">No district data available</div>
  );

  const sliced = data.slice(0, MAX_BARS);
  const maxCount = Math.max(...sliced.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {sliced.map((d) => {
        const barPct = (d.count / maxCount) * 100;
        const eventTypeKeys = Object.keys(d.eventTypes);
        const isHovered = hoveredDistrict === d.district;

        return (
          <div key={d.district} className="group cursor-default" onMouseEnter={() => setHoveredDistrict(d.district)} onMouseLeave={() => setHoveredDistrict(null)}>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate pr-3">{d.district}</span>
              <span className="text-zinc-500 font-medium shrink-0">{d.count} booking{d.count !== 1 ? "s" : ""}</span>
            </div>
            <div className="relative h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              {eventTypeKeys.map((et, etIdx) => {
                const segPct = (d.eventTypes[et] / d.count) * barPct;
                const leftPct = eventTypeKeys.slice(0, etIdx).reduce((acc, k) => acc + (d.eventTypes[k] / d.count) * barPct, 0);
                return (
                  <div key={et} title={`${et}: ${d.eventTypes[et]}`} className="absolute top-0 h-full rounded-full transition-all duration-500" style={{ width: `${segPct}%`, left: `${leftPct}%`, backgroundColor: SEGMENT_COLORS[etIdx % SEGMENT_COLORS.length], opacity: isHovered ? 1 : 0.85 }} />
                );
              })}
            </div>
            {isHovered && eventTypeKeys.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                {eventTypeKeys.map((et, etIdx) => (
                  <span key={et} className="text-[10px] text-zinc-500 flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SEGMENT_COLORS[etIdx % SEGMENT_COLORS.length] }} />{et} ({d.eventTypes[et]})</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
