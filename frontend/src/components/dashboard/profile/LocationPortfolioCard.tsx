"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingGeocoding } from "@/components/booking/hooks/useBookingGeocoding";
import { LocationMapDetails } from "./components/LocationMapDetails";

type LocationPortfolioCardProps = {
  location: string; onLocationChange: (v: string) => void;
  portfolio: string; onPortfolioChange: (v: string) => void;
  city?: string; onCityChange?: (v: string) => void;
  district?: string; onDistrictChange?: (v: string) => void;
  locationMapLink?: string; onLocationMapLinkChange?: (v: string) => void;
  showMapPreviewOnBookingPage?: boolean; onShowMapPreviewOnBookingPageChange?: (v: boolean) => void;
};

export function LocationPortfolioCard({
  location, onLocationChange, portfolio, onPortfolioChange, city, onCityChange,
  district, onDistrictChange, locationMapLink, onLocationMapLinkChange,
  showMapPreviewOnBookingPage, onShowMapPreviewOnBookingPageChange,
}: LocationPortfolioCardProps) {
  const { fetchCityDistrictFromCoords, fetchCoordsFromCityDistrict } = useBookingGeocoding();
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Location & Portfolio</CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">Specify where you operate and showcase where clients can view more of your photography work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="profPort" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Portfolio URL</Label>
          <Input id="profPort" value={portfolio} onChange={(e) => onPortfolioChange(e.target.value)} placeholder="e.g. https://myportfolio.com" className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950" />
        </div>
        {onCityChange && onDistrictChange && onLocationMapLinkChange && (
          <LocationMapDetails
            city={city || ""} onCityChange={onCityChange}
            district={district || ""} onDistrictChange={onDistrictChange}
            locationMapLink={locationMapLink || ""} onLocationMapLinkChange={onLocationMapLinkChange}
            onLocationChange={onLocationChange}
            showMapPreviewOnBookingPage={showMapPreviewOnBookingPage} onShowMapPreviewOnBookingPageChange={onShowMapPreviewOnBookingPageChange}
            fetchCityDistrictFromCoords={fetchCityDistrictFromCoords} fetchCoordsFromCityDistrict={fetchCoordsFromCityDistrict}
          />
        )}
      </CardContent>
    </Card>
  );
}
