"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NominatimSelect } from "@/components/common/NominatimSelect";
import { OSMMapPicker } from "@/components/common/OSMMapPicker";
import { useBookingGeocoding } from "@/components/booking/hooks/useBookingGeocoding";

type LocationPortfolioCardProps = {
  location: string;
  onLocationChange: (v: string) => void;
  portfolio: string;
  onPortfolioChange: (v: string) => void;
  city?: string;
  onCityChange?: (v: string) => void;
  district?: string;
  onDistrictChange?: (v: string) => void;
  locationMapLink?: string;
  onLocationMapLinkChange?: (v: string) => void;
};

export function LocationPortfolioCard({
  location,
  onLocationChange,
  portfolio,
  onPortfolioChange,
  city,
  onCityChange,
  district,
  onDistrictChange,
  locationMapLink,
  onLocationMapLinkChange,
}: LocationPortfolioCardProps) {
  const { fetchCityDistrictFromCoords, fetchCoordsFromCityDistrict } = useBookingGeocoding();
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Location & Portfolio</CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          Specify where you operate and showcase where clients can view more of your photography work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="profPort" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Portfolio URL</Label>
          <Input
            id="profPort"
            value={portfolio}
            onChange={(e) => onPortfolioChange(e.target.value)}
            placeholder="e.g. https://myportfolio.com"
            className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        {/* Location Map Details */}
        {onCityChange && onDistrictChange && onLocationMapLinkChange && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <h4 className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Map Location Details <span className="text-zinc-400 font-normal">(optional)</span>
            </h4>
            
            <div className="space-y-2">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                City &amp; District
              </Label>
              <NominatimSelect
                cityValue={city || ""}
                districtValue={district || ""}
                onSelect={async (c, d) => {
                  onCityChange(c);
                  onDistrictChange(d);
                  onLocationChange(`${c}, ${d}`);
                  const coords = await fetchCoordsFromCityDistrict(c, d);
                  if (coords) {
                    onLocationMapLinkChange(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinates" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                Coordinates <span className="text-zinc-400 font-normal">(optional, e.g. 7.2905715, 80.6337262)</span>
              </Label>
              <Input
                id="coordinates"
                placeholder="Paste exact coordinates (latitude, longitude)..."
                value={
                  locationMapLink
                    ? `${parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[1] || "") || ""}, ${parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[2] || "") || ""}`
                    : ""
                }
                onChange={async (e) => {
                  const val = e.target.value;
                  const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
                  if (match) {
                    const lat = parseFloat(match[1]);
                    const lon = parseFloat(match[2]);
                    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                      onLocationMapLinkChange(`https://www.google.com/maps?q=${lat},${lon}`);
                      const res = await fetchCityDistrictFromCoords(lat, lon);
                      if (res) {
                        onCityChange(res.city);
                        onDistrictChange(res.district);
                        onLocationChange(`${res.city}, ${res.district}`);
                      }
                    }
                  } else {
                    // Optional: If they clear it, maybe clear the map link? But usually handled by the city picker
                  }
                }}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                Base Location Map Preview
              </Label>
              <OSMMapPicker
                lat={locationMapLink ? parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[1] || "") || undefined : undefined}
                lon={locationMapLink ? parseFloat(locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[2] || "") || undefined : undefined}
                city={city}
                district={district}
                onChange={async (lat, lon) => {
                  onLocationMapLinkChange(`https://www.google.com/maps?q=${lat},${lon}`);
                  const res = await fetchCityDistrictFromCoords(lat, lon);
                  if (res) {
                    onCityChange(res.city);
                    onDistrictChange(res.district);
                    onLocationChange(`${res.city}, ${res.district}`);
                  }
                }}
                height="250px"
              />
              {locationMapLink && (
                <p className="text-[10px] text-zinc-400 font-medium truncate mt-1">
                  Google Maps Link: <span className="text-zinc-650 dark:text-zinc-400 font-mono">{locationMapLink}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
