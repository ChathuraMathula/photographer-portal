"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  lat?: number;
  lon?: number;
  onChange: (lat: number, lon: number) => void;
  city?: string;
  district?: string;
  className?: string;
  height?: string;
};

export function OSMMapPicker({
  lat,
  lon,
  onChange,
  city,
  district,
  className = "",
  height = "300px",
}: Props) {
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Default coordinates: Colombo center
  const currentLat = lat ?? 6.9271;
  const currentLon = lon ?? 79.8612;

  // Listen to message events from the sandboxed Leaflet map iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === "OSM_MAP_CLICK") {
        const { lat: clickedLat, lon: clickedLon } = event.data;
        if (typeof clickedLat === "number" && typeof clickedLon === "number") {
          onChange(clickedLat, clickedLon);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onChange]);

  // When city or district changes, geocode the city to center the map there automatically
  useEffect(() => {
    let active = true;
    if (!city && !district) return;
    if (lat !== undefined && lon !== undefined) return;

    async function centerOnCity() {
      setLoading(true);
      try {
        const query = [city, district, "Sri Lanka"].filter(Boolean).join(", ");
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && active) {
            const newLat = parseFloat(data[0].lat);
            const newLon = parseFloat(data[0].lon);
            if (!isNaN(newLat) && !isNaN(newLon)) {
              // Update parent coordinates
              onChange(newLat, newLon);
              // Send postMessage to iframe to pan and center the map view
              iframeRef.current?.contentWindow?.postMessage(
                { type: "OSM_MAP_PAN", lat: newLat, lon: newLon },
                "*"
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to center map picker on city change", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    centerOnCity();
    return () => {
      active = false;
    };
  }, [city, district]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .leaflet-container { font-family: system-ui, -apple-system, sans-serif; }
        .info-panel {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          z-index: 1000;
          font-size: 11px;
          font-weight: 600;
          color: #333;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="info-panel">📍 Click map to position the exact venue pin</div>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: true }).setView([${currentLat}, ${currentLon}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        var marker = L.marker([${currentLat}, ${currentLon}], { draggable: true }).addTo(map);

        // Click event on map
        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;
          marker.setLatLng(e.latlng);
          window.parent.postMessage({ type: 'OSM_MAP_CLICK', lat: lat, lon: lng }, '*');
        });

        // Drag event on marker
        marker.on('dragend', function(e) {
          var lat = marker.getLatLng().lat;
          var lng = marker.getLatLng().lng;
          window.parent.postMessage({ type: 'OSM_MAP_CLICK', lat: lat, lon: lng }, '*');
        });

        // Listen for pan requests
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'OSM_MAP_PAN') {
            var lat = event.data.lat;
            var lon = event.data.lon;
            map.setView([lat, lon], 14);
            marker.setLatLng([lat, lon]);
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <div className={`relative overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-550" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="OpenStreetMap Pin Picker"
        style={{ height, width: "100%", border: 0 }}
        srcDoc={mapHtml}
        sandbox="allow-scripts"
      />
    </div>
  );
}
