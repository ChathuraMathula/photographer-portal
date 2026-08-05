"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NominatimSelect } from "@/components/maps/NominatimSelect";
import { OSMMapPicker } from "@/components/maps/OSMMapPicker";
import { useBookingGeocoding } from "@/components/booking/hooks/useBookingGeocoding";
import { MapPin, ExternalLink } from "lucide-react";

export interface LocationState {
  city: string;
  district: string;
  coordinates: string;
  locationMapLink: string;
}

interface Props {
  location: LocationState;
  onChange: (updated: Partial<LocationState>) => void;
}

export function RegistrationLocationPicker({ location, onChange }: Props) {
  const { geocodingStatus, fetchCityDistrictFromCoords, fetchCoordsFromCityDistrict } =
    useBookingGeocoding();

  const handleNominatimSelect = async (city: string, district: string) => {
    onChange({ city, district });
    const coords = await fetchCoordsFromCityDistrict(city, district);
    if (coords) {
      onChange({
        city,
        district,
        locationMapLink: `https://www.google.com/maps?q=${coords.lat},${coords.lon}`,
      });
    }
  };

  const handleCoordinatesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({ coordinates: val });
    const match = val.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        onChange({ locationMapLink: `https://www.google.com/maps?q=${lat},${lon}`, coordinates: val });
        const res = await fetchCityDistrictFromCoords(lat, lon);
        if (res) {
          onChange({
            coordinates: val,
            city: res.city,
            district: res.district,
            locationMapLink: `https://www.google.com/maps?q=${lat},${lon}`,
          });
        }
      }
    }
  };

  const handleMapPickerChange = async (lat: number, lon: number) => {
    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
    const coords = `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
    onChange({ locationMapLink: mapLink, coordinates: coords });
    const res = await fetchCityDistrictFromCoords(lat, lon);
    if (res) {
      onChange({
        locationMapLink: mapLink,
        coordinates: coords,
        city: res.city,
        district: res.district,
      });
    }
  };

  const parsedLat = location.locationMapLink
    ? parseFloat(location.locationMapLink.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)?.[1] || "")
    : undefined;
  const parsedLon = location.locationMapLink
    ? parseFloat(location.locationMapLink.match(/q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)?.[2] || "")
    : undefined;

  return (
    <div className="space-y-4">
      {/* City & District Nominatim search */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-blue-600" />
          City & District Location
        </Label>
        <NominatimSelect
          cityValue={location.city}
          districtValue={location.district}
          onSelect={handleNominatimSelect}
        />
      </div>

      {/* Manual Coordinates */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Coordinates{" "}
          <span className="text-zinc-400 font-normal">(optional, e.g. 6.9271, 79.8612)</span>
        </Label>
        <Input
          placeholder="e.g. 6.9271, 79.8612"
          value={location.coordinates}
          onChange={handleCoordinatesChange}
          className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 font-mono"
        />
        {geocodingStatus && (
          <p className="text-[11px] text-blue-600 dark:text-blue-400">{geocodingStatus}</p>
        )}
      </div>

      {/* OSM Map Picker */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Pin Location on Map <span className="text-zinc-400 font-normal">(click to pick)</span>
        </Label>
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <OSMMapPicker
            lat={!isNaN(parsedLat!) ? parsedLat : undefined}
            lon={!isNaN(parsedLon!) ? parsedLon : undefined}
            city={location.city}
            district={location.district}
            onChange={handleMapPickerChange}
            height="230px"
          />
        </div>
      </div>

      {/* Generated Google Map Link */}
      {location.locationMapLink && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
            Generated Google Maps Link
          </p>
          <a
            href={location.locationMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate"
          >
            {location.locationMapLink}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
}
