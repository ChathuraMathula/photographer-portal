"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import {
  buildMapPoints,
  buildDistrictStats,
  buildCityStats,
  buildLocationInsights,
  getUniqueEventTypes,
  type RawBooking,
} from "@/app/dashboard/reports/utils/locationUtils";
import { LocationInsightsCard } from "./LocationInsightsCard";
import { DistrictBookingsBar } from "./DistrictBookingsBar";
import { CityBookingsRank } from "./CityBookingsRank";
import { EventTypeByDistrictChart } from "./EventTypeByDistrictChart";
import { EnhancedLocationMap } from "./EnhancedLocationMap";

type Props = {
  rawBookings: RawBooking[];
  title?: string;
  description?: string;
};

export function LocationAnalyticsSection({
  rawBookings,
  title = "Booking Location Analytics",
  description = "Geographic insights derived from booking location data including district breakdowns and event density mapping.",
}: Props) {
  // All derived shapes are computed in a single useMemo — no fetch needed
  const { mapPoints, districtStats, cityStats, insights, eventTypes } = useMemo(() => {
    const mapPoints = buildMapPoints(rawBookings);
    const districtStats = buildDistrictStats(rawBookings);
    const cityStats = buildCityStats(rawBookings);
    const insights = buildLocationInsights(rawBookings, districtStats, cityStats, mapPoints);
    const eventTypes = getUniqueEventTypes(rawBookings);
    return { mapPoints, districtStats, cityStats, insights, eventTypes };
  }, [rawBookings]);

  if (!rawBookings || rawBookings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-indigo-500" />
        <div>
          <h3 className="text-body-base-bold font-bold text-zinc-900 dark:text-white">{title}</h3>
          <p className="text-body-caption text-zinc-500">{description}</p>
        </div>
      </div>

      {/* Insight KPI tiles */}
      <LocationInsightsCard insights={insights} />

      {/* District bar + City rank side-by-side */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-body-small-s font-bold text-zinc-900 dark:text-white">
              Bookings by District
            </CardTitle>
            <CardDescription className="text-xs">Top 10 districts ranked by total bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <DistrictBookingsBar data={districtStats} />
          </CardContent>
        </Card>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-body-small-s font-bold text-zinc-900 dark:text-white">
              Top Cities
            </CardTitle>
            <CardDescription className="text-xs">Top 8 cities ranked by booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <CityBookingsRank data={cityStats} />
          </CardContent>
        </Card>
      </div>

      {/* Event type × district stacked chart */}
      {districtStats.length > 0 && eventTypes.length > 1 && (
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-body-small-s font-bold text-zinc-900 dark:text-white">
              Event Types by District
            </CardTitle>
            <CardDescription className="text-xs">
              Visual breakdown of how event categories are distributed across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventTypeByDistrictChart data={districtStats} eventTypes={eventTypes} />
          </CardContent>
        </Card>
      )}

      {/* Enhanced OSM map with clustered coloured markers */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-body-small-s font-bold text-zinc-900 dark:text-white">
            Interactive Event Location Map
          </CardTitle>
          <CardDescription className="text-xs">
            Exact pin locations extracted from Google Maps coordinates stored per booking.
            Markers are colour-coded by event type and clustered by proximity.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EnhancedLocationMap points={mapPoints} />
        </CardContent>
      </Card>
    </div>
  );
}
