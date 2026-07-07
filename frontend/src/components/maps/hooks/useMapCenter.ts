import { useEffect, useState, type RefObject } from "react";

export function useMapCenter(
  city: string | undefined,
  district: string | undefined,
  lat: number | undefined,
  lon: number | undefined,
  iframeRef: RefObject<HTMLIFrameElement | null>,
  onChange: (lat: number, lon: number) => void
) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!city && !district) return;
    if (lat !== undefined && lon !== undefined) return;

    async function centerOnCity() {
      setLoading(true);
      try {
        const query = [city, district, "Sri Lanka"].filter(Boolean).join(", ");
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && active) {
            const newLat = parseFloat(data[0].lat);
            const newLon = parseFloat(data[0].lon);
            if (!isNaN(newLat) && !isNaN(newLon)) {
              onChange(newLat, newLon);
              iframeRef.current?.contentWindow?.postMessage({ type: "OSM_MAP_PAN", lat: newLat, lon: newLon }, "*");
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
    return () => { active = false; };
  }, [city, district, lat, lon, iframeRef, onChange]);

  return { loading };
}
