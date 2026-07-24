import { useEffect, useState, useRef, type RefObject } from "react";

export function useMapCenter(
  city: string | undefined,
  district: string | undefined,
  lat: number | undefined,
  lon: number | undefined,
  iframeRef: RefObject<HTMLIFrameElement | null>,
  onChange: (lat: number, lon: number) => void,
) {
  const [loading, setLoading] = useState(false);
  const lastGeocodedRef = useRef<string>("");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;
    if (!city && !district) return;

    // If explicit lat & lon coordinates are already provided from a pin or map link, do not auto-geocode
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      return;
    }

    const geoKey = `${city || ""}_${district || ""}`;
    if (lastGeocodedRef.current === geoKey) {
      return;
    }

    async function centerOnCity() {
      setLoading(true);
      try {
        const query = [city, district, "Sri Lanka"].filter(Boolean).join(", ");
        const isOffline = process.env.NEXT_PUBLIC_OFFLINE_MAPS === "true";
        const baseUrl = isOffline
          ? "http://localhost:8081"
          : "https://nominatim.openstreetmap.org";
        const res = await fetch(
          `${baseUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } },
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && active) {
            const newLat = parseFloat(data[0].lat);
            const newLon = parseFloat(data[0].lon);
            if (!isNaN(newLat) && !isNaN(newLon)) {
              lastGeocodedRef.current = geoKey;
              onChangeRef.current(newLat, newLon);
              iframeRef.current?.contentWindow?.postMessage(
                { type: "OSM_MAP_PAN", lat: newLat, lon: newLon },
                "*",
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
  }, [city, district, lat, lon, iframeRef]);

  return { loading };
}
