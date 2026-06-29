"use client";

import React, { useState, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

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
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Attempt to parse coordinates from Google Maps URL or geocode address via Nominatim
  useEffect(() => {
    let active = true;

    async function resolveLocation() {
      setLoading(true);
      setErrorMsg("");
      setCoords(null);

      try {
        let targetLink = locationMapLink;

        // If it's a shortened URL, resolve it via backend
        if (locationMapLink && (locationMapLink.includes("maps.app.goo.gl") || locationMapLink.includes("goo.gl/maps"))) {
          try {
            const apiRes = await fetch(
              `${API}/bookings/resolve-map-link?url=${encodeURIComponent(locationMapLink)}`
            );
            if (apiRes.ok) {
              const apiJson = await apiRes.json();
              if (apiJson.expandedUrl) {
                targetLink = apiJson.expandedUrl;
              }
            }
          } catch (e) {
            console.error("Failed resolving map link redirect", e);
          }
        }

        // 1. Check if we can parse coordinates from the Google Maps link directly
        if (targetLink) {
          const atMatch = targetLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          const qMatch = targetLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          const placeMatch = targetLink.match(/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
          
          const latStr = atMatch?.[1] || qMatch?.[1] || placeMatch?.[1];
          const lonStr = atMatch?.[2] || qMatch?.[2] || placeMatch?.[2];

          if (latStr && lonStr) {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            if (!isNaN(lat) && !isNaN(lon) && active) {
              setCoords({ lat, lon });
              setLoading(false);
              return;
            }
          }

          // Fallback: If no coordinates in URL, try extracting place name
          const placeNameMatch = targetLink.match(/\/place\/([^/]+)/);
          if (placeNameMatch?.[1]) {
            const placeName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, " "));
            const nominatimRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`,
              { headers: { "Accept-Language": "en" } }
            );
            if (nominatimRes.ok) {
              const nomData = await nominatimRes.json();
              if (nomData && nomData.length > 0) {
                const lat = parseFloat(nomData[0].lat);
                const lon = parseFloat(nomData[0].lon);
                if (!isNaN(lat) && !isNaN(lon) && active) {
                  setCoords({ lat, lon });
                  setLoading(false);
                  return;
                }
              }
            }
          }
        }

        // 2. Geocode using Nominatim API based on address, city, and district
        const queryParts: string[] = [];
        if (location) queryParts.push(location);
        if (city) queryParts.push(city);
        if (district) queryParts.push(district);
        if (queryParts.length === 0 && targetLink) {
          queryParts.push("Sri Lanka");
        }

        const query = queryParts.join(", ");
        if (!query.trim()) {
          if (active) {
            setErrorMsg("No location data available to display.");
            setLoading(false);
          }
          return;
        }

        // Fetch geocoded results from OSM Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        if (!response.ok) throw new Error("Geocoding service unavailable.");

        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon) && active) {
            setCoords({ lat, lon });
          }
        } else {
          // If full query fails, try falling back to just city/district
          const fallbackParts: string[] = [];
          if (city) fallbackParts.push(city);
          if (district) fallbackParts.push(district);
          if (fallbackParts.length > 0) {
            const fallbackQuery = fallbackParts.join(", ");
            const fallbackResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const fallbackData = await fallbackResponse.json();
            if (fallbackData && fallbackData.length > 0 && active) {
              const lat = parseFloat(fallbackData[0].lat);
              const lon = parseFloat(fallbackData[0].lon);
              setCoords({ lat, lon });
              return;
            }
          }
          
          // Try district only
          if (district) {
            const distResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(district)}&format=json&limit=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const distData = await distResponse.json();
            if (distData && distData.length > 0 && active) {
              const lat = parseFloat(distData[0].lat);
              const lon = parseFloat(distData[0].lon);
              setCoords({ lat, lon });
              return;
            }
          }

          // Ultimate fallback to Sri Lanka center
          const lkResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=Sri+Lanka&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const lkData = await lkResponse.json();
          if (lkData && lkData.length > 0 && active) {
            const lat = parseFloat(lkData[0].lat);
            const lon = parseFloat(lkData[0].lon);
            setCoords({ lat, lon });
            return;
          }

          if (active) {
            setErrorMsg("Could not find address on OpenStreetMap.");
          }
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || "Failed to load map.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    resolveLocation();

    return () => {
      active = false;
    };
  }, [location, city, district, locationMapLink]);

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
        {errorMsg && <span className="text-[9px] text-red-500 mt-1">{errorMsg}</span>}
      </div>
    );
  }

  const popupText = [location, city, district].filter(Boolean).join(", ");
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        /* Clean Map Styles */
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: true }).setView([${coords.lat}, ${coords.lon}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        }).addTo(map);
        
        L.marker([${coords.lat}, ${coords.lon}]).addTo(map)
          .bindPopup("<b>Event Location</b><br/>${popupText.replace(/"/g, '\\"')}")
          .openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <div className={`overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${className}`}>
      <iframe
        title="OpenStreetMap Location Preview"
        style={{ height, width: "100%", border: 0 }}
        srcDoc={mapHtml}
        sandbox="allow-scripts"
      />
    </div>
  );
}
