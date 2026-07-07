import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { NominatimSelect } from "@/components/maps/NominatimSelect";
import { OSMMapPicker } from "@/components/maps/OSMMapPicker";
import { useBookingGeocoding } from "@/components/booking/hooks/useBookingGeocoding";

export type LocationPickerFormValues = {
  city: string;
  district: string;
  locationMapLink: string;
  coordinates?: string;
};

type Props<T extends LocationPickerFormValues> = {
  formik: FormikProps<T>;
  isRequired?: boolean;
};

export function LocationPickerFormFields<T extends LocationPickerFormValues>({
  formik,
  isRequired = false,
}: Props<T>) {
  const { geocodingStatus, fetchCityDistrictFromCoords, fetchCoordsFromCityDistrict } =
    useBookingGeocoding();

  const handleCoordinatesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    formik.setFieldValue("coordinates", val);
    const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        formik.setFieldValue(
          "locationMapLink",
          `https://www.google.com/maps?q=${lat},${lon}`
        );

        const res = await fetchCityDistrictFromCoords(lat, lon);
        if (res) {
          formik.setFieldValue("city", res.city);
          formik.setFieldValue("district", res.district);
          if ("baseLocation" in formik.values) {
            formik.setFieldValue("baseLocation", `${res.city}, ${res.district}`);
          }
        }
      }
    }
  };

  const handleNominatimSelect = async (city: string, district: string) => {
    formik.setFieldValue("city", city);
    formik.setFieldValue("district", district);
    if ("baseLocation" in formik.values) {
      formik.setFieldValue("baseLocation", `${city}, ${district}`);
    }
    if (!formik.values.coordinates) {
      const coords = await fetchCoordsFromCityDistrict(city, district);
      if (coords) {
        formik.setFieldValue(
          "locationMapLink",
          `https://www.google.com/maps?q=${coords.lat},${coords.lon}`
        );
      }
    }
  };

  const handleMapPickerChange = async (lat: number, lon: number) => {
    formik.setFieldValue("locationMapLink", `https://www.google.com/maps?q=${lat},${lon}`);
    formik.setFieldValue("coordinates", `${lat.toFixed(7)}, ${lon.toFixed(7)}`);

    const res = await fetchCityDistrictFromCoords(lat, lon);
    if (res) {
      formik.setFieldValue("city", res.city);
      formik.setFieldValue("district", res.district);
      if ("baseLocation" in formik.values) {
        formik.setFieldValue("baseLocation", `${res.city}, ${res.district}`);
      }
    }
  };

  const hasCityDistrictError =
    ((formik.touched as any).city && (formik.errors as any).city) ||
    ((formik.touched as any).district && (formik.errors as any).district);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
          City &amp; District {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <NominatimSelect
          cityValue={formik.values.city}
          districtValue={formik.values.district}
          onSelect={handleNominatimSelect}
          error={hasCityDistrictError ? "Error" : undefined}
        />
        <FieldError
          msg={
            hasCityDistrictError
              ? ((formik.errors as any).city || (formik.errors as any).district)
              : undefined
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coordinates" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
          Coordinates <span className="text-zinc-400 font-normal">(optional, e.g. 7.2905715, 80.6337262)</span>
        </Label>
        <Input
          id="coordinates"
          placeholder="Paste exact coordinates (latitude, longitude)..."
          value={formik.values.coordinates || ""}
          onChange={handleCoordinatesChange}
          className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
        />
        {geocodingStatus && (
          <p className="text-[10px] text-zinc-550 dark:text-zinc-400 font-semibold animate-pulse mt-1">
            {geocodingStatus}
          </p>
        )}
        <FieldError
          msg={(formik.touched as any).coordinates ? (formik.errors as any).coordinates : undefined}
        />
      </div>

      {formik.values.coordinates ? (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-medium border border-emerald-100 dark:border-emerald-900/30">
          📍 Pinning exact coordinates. The map preview shows your exact venue location.
        </div>
      ) : formik.values.city || formik.values.district ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-xs rounded-xl font-medium border border-blue-100 dark:border-blue-900/30">
          ℹ️ No coordinates provided. The preview map shows the center of the selected city/district. We recommend pinning the exact location on the map picker or entering coordinates.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
          Venue Location Map Preview {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <OSMMapPicker
          lat={
            formik.values.locationMapLink
              ? parseFloat(formik.values.locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[1] || "") || undefined
              : undefined
          }
          lon={
            formik.values.locationMapLink
              ? parseFloat(formik.values.locationMapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/)?.[2] || "") || undefined
              : undefined
          }
          city={formik.values.city}
          district={formik.values.district}
          onChange={handleMapPickerChange}
          height="250px"
        />
        {formik.values.locationMapLink && (
          <p className="text-[10px] text-zinc-400 font-medium truncate mt-1">
            Generated Coordinates Link: <span className="text-zinc-650 dark:text-zinc-400 font-mono">{formik.values.locationMapLink}</span>
          </p>
        )}
        <FieldError
          msg={(formik.touched as any).locationMapLink ? (formik.errors as any).locationMapLink : undefined}
        />
      </div>
    </div>
  );
}
