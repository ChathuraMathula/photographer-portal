"use client";
import React from "react";
import { Map } from "lucide-react";
import { type MapPoint } from "@/app/dashboard/reports/utils/locationUtils";

const ET_MARKER_COLORS: Record<string, string> = {
  Wedding: "#ec4899",
  Portrait: "#6366f1",
  Corporate: "#3b82f6",
  "Birthday Party": "#f59e0b",
  Graduation: "#10b981",
  Engagement: "#f97316",
  Maternity: "#8b5cf6",
  Other: "#a1a1aa",
};
function pickColor(et: string): string {
  return ET_MARKER_COLORS[et] || "#6366f1";
}

function buildMapHtml(points: MapPoint[]): string {
  const serialized = JSON.stringify(
    points.map((p) => ({ ...p, color: pickColor(p.eventType) })),
  );
  const isOffline = process.env.NEXT_PUBLIC_OFFLINE_MAPS === "true";
  const tileUrl = isOffline
    ? "http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const leafletCss = isOffline
    ? "/leaflet/leaflet.css"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const markerClusterCss = isOffline
    ? "/leaflet/MarkerCluster.css"
    : "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
  const markerClusterDefaultCss = isOffline
    ? "/leaflet/MarkerCluster.Default.css"
    : "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
  const leafletJs = isOffline
    ? "/leaflet/leaflet.js"
    : "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  const markerClusterJs = isOffline
    ? "/leaflet/leaflet.markercluster.js"
    : "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><link rel="stylesheet" href="${leafletCss}"/><link rel="stylesheet" href="${markerClusterCss}"/><link rel="stylesheet" href="${markerClusterDefaultCss}"/><script src="${leafletJs}"></script><script src="${markerClusterJs}"></script><style>body, html, #map { margin:0; padding:0; height:100%; width:100%; } .custom-pin { width:14px; height:14px; border-radius:50%; border:2.5px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.35); } .leaflet-popup-content { font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.5; min-width: 160px; } .pop-et { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; opacity:.7; } .pop-label { font-weight:600; margin-top:2px; } .pop-meta { font-size:10px; color:#6b7280; margin-top:2px; }</style></head>
<body><div id="map"></div><script>
var map = L.map('map', { zoomControl: true }).setView([7.8731, 80.7718], 8);
L.tileLayer('${tileUrl}', { maxZoom: 19, attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' }).addTo(map);
var pts = ${serialized}; var cluster = L.markerClusterGroup({ maxClusterRadius: 40, showCoverageOnHover: false });
pts.forEach(function(pt) { var icon = L.divIcon({ className: '', html: '<div class="custom-pin" style="background:' + pt.color + '"></div>', iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10] }); var date = new Date(pt.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); var popup = '<div class="pop-et" style="color:' + pt.color + '">' + pt.eventType + '</div><div class="pop-label">' + pt.label + '</div><div class="pop-meta">' + date + (pt.district ? ' &bull; ' + pt.district : '') + '</div>'; L.marker([pt.lat, pt.lon], { icon: icon }).bindPopup(popup).addTo(cluster); });
map.addLayer(cluster); if (pts.length > 0) { try { map.fitBounds(cluster.getBounds().pad(0.15)); } catch(e) {} }
</script></body></html>`;
}

export function EnhancedLocationMap({ points }: { points: MapPoint[] }) {
  if (points.length === 0)
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-xs p-4 text-center gap-1.5">
        <Map className="h-6 w-6 text-zinc-350 dark:text-zinc-550" />
        <span className="font-semibold text-zinc-600 dark:text-zinc-350">
          No exact coordinates available
        </span>
        <span className="text-[10px] text-zinc-450 dark:text-zinc-500">
          Bookings with a Google Maps link containing coordinates will appear
          here.
        </span>
      </div>
    );
  return (
    <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <iframe
        title="Booking Location Map"
        style={{ height: "420px", width: "100%", border: 0 }}
        srcDoc={buildMapHtml(points)}
        sandbox="allow-scripts"
      />
    </div>
  );
}
