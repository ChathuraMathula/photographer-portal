"use client";
import React from "react";
import { Loader2, MapPin } from "lucide-react";
import { useMapPreviewLocation } from "./hooks/useMapPreviewLocation";
import { getPreviewMapHtml } from "./utils/getPreviewMapHtml";

type Props = {
  location?: string;
  city?: string;
  district?: string;
  locationMapLink?: string;
  className?: string;
  height?: string;
};

export function OSMMapPreview({
  location,
  city,
  district,
  locationMapLink,
  className = "",
  height = "300px",
}: Props) {
  const { coords, loading, errorMsg } = useMapPreviewLocation(
    locationMapLink,
    location,
    city,
    district,
  );

  if (loading) {
    return (
      <div
        style={{ height }}
        className={`w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs gap-2 ${className}`}
      >
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        <span>Resolving location preview...</span>
      </div>
    );
  }

  if (errorMsg || !coords) {
    return (
      <div
        style={{ height }}
        className={`w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-zinc-500 text-xs p-4 text-center gap-1 ${className}`}
      >
        <MapPin className="h-5 w-5 text-zinc-400 mb-1" />
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          Location: {location || "No Address"}
        </span>
        <span className="text-[10px] text-zinc-400">
          {[city, district].filter(Boolean).join(", ") || "No city/district"}
        </span>
        {errorMsg && (
          <span className="text-[9px] text-red-500 mt-1">{errorMsg}</span>
        )}
      </div>
    );
  }

  const popupText = [location, city, district].filter(Boolean).join(", ");

  return (
    <div
      className={`overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${className}`}
    >
      <iframe
        title="OpenStreetMap Location Preview"
        style={{ height, width: "100%", border: 0 }}
        srcDoc={getPreviewMapHtml(coords.lat, coords.lon, popupText)}
        sandbox="allow-scripts"
      />
    </div>
  );
}
