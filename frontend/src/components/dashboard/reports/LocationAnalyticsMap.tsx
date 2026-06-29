"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Map } from "lucide-react";
import { type Reservation } from "@/types";

export function LocationAnalyticsMap({ bookings }: { bookings: any[] }) {
  const [points, setPoints] = useState<{ lat: number; lon: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function geocodeBookings() {
      setLoading(true);
      const resolvedPoints: { lat: number; lon: number; label: string }[] = [];

      // Filter bookings that have location details
      const validBookings = bookings.filter(b => b.location || b.locationMapLink || b.city || b.district);

      // Perform geocoding/parsing
      for (const b of validBookings) {
        // 1. Google Maps Link coords parser
        if (b.locationMapLink) {
          const atMatch = b.locationMapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          const qMatch = b.locationMapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          const latStr = atMatch?.[1] || qMatch?.[1];
          const lonStr = atMatch?.[2] || qMatch?.[2];
          if (latStr && lonStr) {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            if (!isNaN(lat) && !isNaN(lon)) {
              resolvedPoints.push({
                lat,
                lon,
                label: `${b.customer?.firstName || ""} ${b.customer?.lastName || ""} - ${b.eventType} at ${b.location || b.city || ""}`
              });
              continue;
            }
          }
        }

        // 2. Nominatim search fallback
        const queryParts: string[] = [];
        if (b.location) queryParts.push(b.location);
        if (b.city) queryParts.push(b.city);
        if (b.district) queryParts.push(b.district);
        const query = queryParts.join(", ");
        if (query.trim()) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
              {
                headers: { "Accept-Language": "en" }
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                resolvedPoints.push({
                  lat,
                  lon,
                  label: `${b.customer?.firstName || ""} ${b.customer?.lastName || ""} - ${b.eventType} at ${query}`
                });
              }
            }
          } catch (e) {
            console.error("Geocoding failed for booking: ", b.id, e);
          }
        }
      }

      if (active) {
        setPoints(resolvedPoints);
        setLoading(false);
      }
    }

    geocodeBookings();
    return () => {
      active = false;
    };
  }, [bookings]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-xs gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        <span>Generating Location Density Heatmap...</span>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-xs p-4 text-center gap-1">
        <Map className="h-6 w-6 text-zinc-350 dark:text-zinc-550 mb-1" />
        <span className="font-semibold text-zinc-600 dark:text-zinc-350">No geocoded bookings found</span>
        <span className="text-[10px] text-zinc-450 dark:text-zinc-500">Bookings need location address, city, district or map link to show on preview.</span>
      </div>
    );
  }

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        .leaflet-container { font-family: system-ui, -apple-system, sans-serif; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([7.8731, 80.7718], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        }).addTo(map);

        var points = ${JSON.stringify(points)};
        var markers = [];

        points.forEach(function(pt) {
          var m = L.marker([pt.lat, pt.lon]).addTo(map)
            .bindPopup("<b>" + pt.label + "</b>");
          markers.push(m);
        });

        if (markers.length > 0) {
          var group = new L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.1));
        }
      </script>
    </body>
    </html>
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
