"use client";
import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import { useMapEvents } from "./hooks/useMapEvents";
import { useMapCenter } from "./hooks/useMapCenter";
import { getMapHtml } from "./utils/getMapHtml";

type Props = {
  lat?: number;
  lon?: number;
  onChange: (lat: number, lon: number) => void;
  city?: string;
  district?: string;
  className?: string;
  height?: string;
  readOnly?: boolean;
};

export function OSMMapPicker({
  lat,
  lon,
  onChange,
  city,
  district,
  className = "",
  height = "300px",
  readOnly = false,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentLat = lat ?? 6.9271;
  const currentLon = lon ?? 79.8612;

  useMapEvents(onChange);
  const { loading } = useMapCenter(
    city,
    district,
    lat,
    lon,
    iframeRef,
    onChange,
  );

  return (
    <div
      className={`relative overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-550" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="OpenStreetMap Pin Picker"
        style={{ height, width: "100%", border: 0 }}
        srcDoc={getMapHtml(currentLat, currentLon, readOnly)}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
