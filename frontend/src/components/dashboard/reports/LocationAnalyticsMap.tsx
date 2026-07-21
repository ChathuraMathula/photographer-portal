"use client";
import React from "react";
import { Loader2, Map } from "lucide-react";
import { useLocationAnalyticsMap } from "./hooks/useLocationAnalyticsMap";

export function LocationAnalyticsMap({ bookings }: { bookings: any[] }) {
  const { points, loading } = useLocationAnalyticsMap(bookings);

  if (loading)
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-xs gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        <span>Generating Location Density Heatmap...</span>
      </div>
    );

  if (points.length === 0)
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-xs p-4 text-center gap-1">
        <Map className="h-6 w-6 text-zinc-350 dark:text-zinc-550 mb-1" />
        <span className="font-semibold text-zinc-600 dark:text-zinc-350">
          No geocoded bookings found
        </span>
        <span className="text-[10px] text-zinc-450 dark:text-zinc-500">
          Bookings need location address, city, district or map link to show on
          preview.
        </span>
      </div>
    );

  const isOffline = process.env.NEXT_PUBLIC_OFFLINE_MAPS === "true";
  const tileUrl = isOffline
    ? "http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const leafletCss = isOffline
    ? "/leaflet/leaflet.css"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const leafletJs = isOffline
    ? "/leaflet/leaflet.js"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

  const mapHtml = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"/><link rel="stylesheet" href="${leafletCss}" /><script src="${leafletJs}"></script><style>body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; } .leaflet-container { font-family: system-ui, -apple-system, sans-serif; }</style></head>
    <body><div id="map"></div><script>
      ${isOffline ? `L.Icon.Default.imagePath = '/leaflet/images/';` : ''}
      var map = L.map('map').setView([7.8731, 80.7718], 8);
      L.tileLayer('${tileUrl}', { maxZoom: 19, attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' }).addTo(map);
      var points = ${JSON.stringify(points)}; var markers = [];
      points.forEach(function(pt) { markers.push(L.marker([pt.lat, pt.lon]).addTo(map).bindPopup("<b>" + pt.label + "</b>")); });
      if (markers.length > 0) map.fitBounds(new L.featureGroup(markers).getBounds().pad(0.1));
    </script></body></html>
  `;

  return (
    <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
      <iframe
        title="Location Analytics Density Heatmap"
        style={{ height: "400px", width: "100%", border: 0 }}
        srcDoc={mapHtml}
        sandbox="allow-scripts"
      />
    </div>
  );
}
