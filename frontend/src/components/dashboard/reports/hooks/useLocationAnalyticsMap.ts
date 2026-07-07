import { useState, useEffect } from "react";

export function useLocationAnalyticsMap(bookings: any[]) {
  const [points, setPoints] = useState<{ lat: number; lon: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function geocodeBookings() {
      setLoading(true);
      const resolvedPoints: { lat: number; lon: number; label: string }[] = [];
      const validBookings = bookings.filter(b => b.location || b.locationMapLink || b.city || b.district);

      for (const b of validBookings) {
        if (b.locationMapLink) {
          const atMatch = b.locationMapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          const qMatch = b.locationMapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          const latStr = atMatch?.[1] || qMatch?.[1];
          const lonStr = atMatch?.[2] || qMatch?.[2];
          if (latStr && lonStr) {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            if (!isNaN(lat) && !isNaN(lon)) {
              resolvedPoints.push({ lat, lon, label: `${b.customer?.firstName || ""} ${b.customer?.lastName || ""} - ${b.eventType} at ${b.location || b.city || ""}` });
              continue;
            }
          }
        }

        const queryParts: string[] = [];
        if (b.location) queryParts.push(b.location);
        if (b.city) queryParts.push(b.city);
        if (b.district) queryParts.push(b.district);
        const query = queryParts.join(", ");
        if (query.trim()) {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
            if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                resolvedPoints.push({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: `${b.customer?.firstName || ""} ${b.customer?.lastName || ""} - ${b.eventType} at ${query}` });
              }
            }
          } catch (e) {
            console.error("Geocoding failed for booking: ", b.id, e);
          }
        }
      }

      if (active) { setPoints(resolvedPoints); setLoading(false); }
    }
    geocodeBookings();
    return () => { active = false; };
  }, [bookings]);

  return { points, loading };
}
