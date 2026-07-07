"use client";

import React from "react";
import { OSMMapPreview } from "@/components/common/OSMMapPreview";

interface CustomerLocationSectionProps {
  startTime: string;
  endTime: string;
  eventType: string;
  location?: string;
  locationMapLink?: string;
  city?: string;
  district?: string;
}

export function CustomerLocationSection({
  startTime,
  endTime,
  eventType,
  location,
  locationMapLink,
  city,
  district,
}: CustomerLocationSectionProps) {
  const hasLocationDetails = !!(location || locationMapLink || city || district);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div>
          <p className="text-body-caption font-semibold text-zinc-400">Date &amp; Location</p>
          <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
            {startTime} - {endTime}
          </p>
          <p className="text-body-caption text-zinc-500 mt-0.5 font-medium">
            {location || "Location not given"}
          </p>
          {(city || district) && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold mt-0.5 uppercase tracking-wider">
              {city && `City: ${city}`}
              {district && ` | District: ${district}`}
            </p>
          )}
          {locationMapLink && (
            <a
              href={locationMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-650 hover:text-blue-700 dark:text-blue-400 hover:underline transition-all"
            >
              🗺️ View on Google Maps
            </a>
          )}
        </div>
        <div>
          <p className="text-body-caption font-semibold text-zinc-400">Event</p>
          <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
            {eventType}
          </p>
        </div>
      </div>

      {hasLocationDetails && (
        <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="text-body-caption font-semibold text-zinc-400 mb-2">Location Map Preview</p>
          <OSMMapPreview
            location={location}
            city={city}
            district={district}
            locationMapLink={locationMapLink}
            height="200px"
          />
        </div>
      )}
    </>
  );
}
