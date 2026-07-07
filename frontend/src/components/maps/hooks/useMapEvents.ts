import { useEffect } from "react";

export function useMapEvents(onChange: (lat: number, lon: number) => void) {
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
    return () => window.removeEventListener("message", handleMessage);
  }, [onChange]);
}
