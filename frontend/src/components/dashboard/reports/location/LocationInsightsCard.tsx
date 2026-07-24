"use client";

import React from "react";
import { MapPin, Building2, Crosshair, TrendingUp } from "lucide-react";
import { type LocationInsightsSummary } from "@/app/dashboard/reports/utils/locationUtils";

type Props = {
  insights: LocationInsightsSummary;
};

type StatTileProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
};

function StatTile({
  icon,
  label,
  value,
  sub,
  accent = "text-zinc-900 dark:text-white",
}: StatTileProps) {
  return (
    <div className="flex items-start gap-3 bg-zinc-50/60 dark:bg-zinc-800/40 rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-700/50">
      <div className="mt-0.5 text-zinc-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-extrabold truncate ${accent}`}>{value}</p>
        {sub && <p className="text-[10px] text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function LocationInsightsCard({ insights }: Props) {
  const {
    topDistrict,
    topCity,
    totalWithCoords,
    totalWithLocation,
    totalBookings,
    coveragePercent,
  } = insights;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile
        icon={<MapPin className="h-4 w-4" />}
        label="Top District"
        value={topDistrict ?? "—"}
        sub="Most booked district"
        accent="text-indigo-700 dark:text-indigo-400"
      />
      <StatTile
        icon={<Building2 className="h-4 w-4" />}
        label="Top City"
        value={topCity ?? "—"}
        sub="Most booked city"
        accent="text-emerald-700 dark:text-emerald-400"
      />
      <StatTile
        icon={<Crosshair className="h-4 w-4" />}
        label="Exact Coordinates"
        value={`${totalWithCoords} bookings`}
        sub="Pinned on map precisely"
        accent="text-blue-700 dark:text-blue-400"
      />
      <StatTile
        icon={<TrendingUp className="h-4 w-4" />}
        label="GPS Pin Coverage"
        value={`${coveragePercent}%`}
        sub={`${totalWithCoords} of ${totalBookings} pinned on map`}
        accent={
          coveragePercent >= 75
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-amber-700 dark:text-amber-400"
        }
      />
    </div>
  );
}
