import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useMapPreviewLocation(
  locationMapLink?: string,
  location?: string,
  city?: string,
  district?: string,
) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    async function resolveLocation() {
      setLoading(true);
      setErrorMsg("");
      const isOffline = process.env.NEXT_PUBLIC_OFFLINE_MAPS === "true";
      const baseUrl = isOffline
        ? "http://localhost:8081"
        : "https://nominatim.openstreetmap.org";
      try {
        let targetLink = locationMapLink;
        if (
          locationMapLink &&
          (locationMapLink.includes("maps.app.goo.gl") ||
            locationMapLink.includes("goo.gl/maps"))
        ) {
          try {
            const apiRes = await fetch(
              `${API}/bookings/resolve-map-link?url=${encodeURIComponent(locationMapLink)}`,
            );
            if (apiRes.ok) {
              const apiJson = await apiRes.json();
              if (apiJson.expandedUrl) targetLink = apiJson.expandedUrl;
            }
          } catch (e) {
            console.error("Failed resolving map link redirect", e);
          }
        }

        if (targetLink) {
          const atMatch = targetLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          const qMatch = targetLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          const placeMatch = targetLink.match(
            /place\/(-?\d+\.\d+),(-?\d+\.\d+)/,
          );
          const latStr = atMatch?.[1] || qMatch?.[1] || placeMatch?.[1];
          const lonStr = atMatch?.[2] || qMatch?.[2] || placeMatch?.[2];
          if (latStr && lonStr) {
            const lat = parseFloat(latStr),
              lon = parseFloat(lonStr);
            if (!isNaN(lat) && !isNaN(lon) && active) {
              setCoords({ lat, lon });
              setLoading(false);
              return;
            }
          }
          const placeNameMatch = targetLink.match(/\/place\/([^/]+)/);
          if (placeNameMatch?.[1]) {
            const placeName = decodeURIComponent(
              placeNameMatch[1].replace(/\+/g, " "),
            );
            const nominatimRes = await fetch(
              `${baseUrl}/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`,
              { headers: { "Accept-Language": "en" } },
            );
            if (nominatimRes.ok) {
              const nomData = await nominatimRes.json();
              if (nomData && nomData.length > 0) {
                const lat = parseFloat(nomData[0].lat),
                  lon = parseFloat(nomData[0].lon);
                if (!isNaN(lat) && !isNaN(lon) && active) {
                  setCoords({ lat, lon });
                  setLoading(false);
                  return;
                }
              }
            }
          }
        }

        const queryParts: string[] = [];
        if (location) queryParts.push(location);
        if (city) queryParts.push(city);
        if (district) queryParts.push(district);
        if (queryParts.length === 0 && targetLink) queryParts.push("Sri Lanka");
        const query = queryParts.join(", ");
        if (!query.trim()) {
          if (active) {
            setErrorMsg("No location data available to display.");
            setLoading(false);
          }
          return;
        }

        const response = await fetch(
          `${baseUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } },
        );
        if (!response.ok) throw new Error("Geocoding service unavailable.");
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat),
            lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon) && active) setCoords({ lat, lon });
        } else {
          const fallbackParts: string[] = [];
          if (city) fallbackParts.push(city);
          if (district) fallbackParts.push(district);
          if (fallbackParts.length > 0) {
            const fallbackResponse = await fetch(
              `${baseUrl}/search?q=${encodeURIComponent(fallbackParts.join(", "))}&format=json&limit=1`,
              { headers: { "Accept-Language": "en" } },
            );
            const fallbackData = await fallbackResponse.json();
            if (fallbackData && fallbackData.length > 0 && active) {
              setCoords({
                lat: parseFloat(fallbackData[0].lat),
                lon: parseFloat(fallbackData[0].lon),
              });
              return;
            }
          }
          if (district) {
            const distResponse = await fetch(
              `${baseUrl}/search?q=${encodeURIComponent(district)}&format=json&limit=1`,
              { headers: { "Accept-Language": "en" } },
            );
            const distData = await distResponse.json();
            if (distData && distData.length > 0 && active) {
              setCoords({
                lat: parseFloat(distData[0].lat),
                lon: parseFloat(distData[0].lon),
              });
              return;
            }
          }
          const lkResponse = await fetch(
            `${baseUrl}/search?q=Sri+Lanka&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const lkData = await lkResponse.json();
          if (lkData && lkData.length > 0 && active) {
            setCoords({
              lat: parseFloat(lkData[0].lat),
              lon: parseFloat(lkData[0].lon),
            });
            return;
          }
          if (active) setErrorMsg("Could not find address on OpenStreetMap.");
        }
      } catch (err: any) {
        if (active) setErrorMsg(err.message || "Failed to load map.");
      } finally {
        if (active) setLoading(false);
      }
    }
    resolveLocation();
    return () => {
      active = false;
    };
  }, [location, city, district, locationMapLink]);

  return { coords, loading, errorMsg };
}
