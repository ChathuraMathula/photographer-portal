import React from "react";
import { type PhotographerProfile } from "@/types";
import { OSMMapPicker } from "@/components/maps/OSMMapPicker";

export function PhotographerHeaderMap({ profile }: { profile: PhotographerProfile }) {
  if (!profile.showMapPreviewOnBookingPage || !profile.locationMapLink) return null;

  const latMatch = profile.locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  const lat = latMatch ? parseFloat(latMatch[1]) : undefined;
  const lon = latMatch ? parseFloat(latMatch[2]) : undefined;

  return (
    <div className="border-t border-zinc-100 dark:border-zinc-850 p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
      <p className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300 mb-3 ml-1">
        Service Location Map
      </p>
      <OSMMapPicker
        lat={lat}
        lon={lon}
        city={profile.city}
        district={profile.district}
        onChange={() => {}}
        height="180px"
        readOnly={true}
      />
    </div>
  );
}
