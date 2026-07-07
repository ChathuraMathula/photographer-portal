import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { EventTypeSelect } from "@/components/booking/EventTypeSelect";
import { NominatimSelect } from "@/components/maps/NominatimSelect";
import { OSMMapPicker } from "@/components/maps/OSMMapPicker";
import { type ManualBookingValues } from "@/components/modals/ManualBookingModal";
import { useManualBookingGeocode } from "../hooks/useManualBookingGeocode";

type Props = { formik: FormikProps<ManualBookingValues>; allowedEventTypes?: string[]; allowCustomEventTypes?: boolean; };

export function ManualBookingLocationFields({ formik, allowedEventTypes = [], allowCustomEventTypes = true }: Props) {
  const { geocodingStatus, handleCityDistrictSelect, handleCoordinatesChange, handleMapChange } = useManualBookingGeocode(formik);

  const getMapCoords = () => {
    const m = formik.values.locationMapLink?.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    return { lat: m ? parseFloat(m[1]) : undefined, lon: m ? parseFloat(m[2]) : undefined };
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Event Type</Label>
          <EventTypeSelect value={formik.values.eventType} onChange={(val) => formik.setFieldValue("eventType", val)} allowedEventTypes={allowedEventTypes} allowCustomEventTypes={allowCustomEventTypes} error={formik.touched.eventType ? formik.errors.eventType : undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mb-location" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Venue / Location <span className="text-red-500">*</span></Label>
          <Input id="mb-location" placeholder="e.g. Cinnamon Grand" {...formik.getFieldProps("location")} className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark ${formik.touched.location && formik.errors.location ? "border-red-500" : ""}`} />
          <FieldError msg={formik.touched.location ? formik.errors.location : undefined} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">City &amp; District <span className="text-red-500">*</span></Label>
        <NominatimSelect cityValue={formik.values.city} districtValue={formik.values.district} onSelect={handleCityDistrictSelect} error={(formik.touched.city && formik.errors.city) || (formik.touched.district && formik.errors.district) ? "Error" : undefined} />
        <FieldError msg={(formik.touched.city && formik.errors.city) || (formik.touched.district && formik.errors.district) ? (formik.errors.city || formik.errors.district) : undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mb-coordinates" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Coordinates <span className="text-zinc-400 font-normal">(optional)</span></Label>
        <Input id="mb-coordinates" placeholder="Paste exact coordinates..." value={formik.values.coordinates} onChange={(e) => handleCoordinatesChange(e.target.value)} className={`h-11 rounded-xl border-zinc-200 ${formik.touched.coordinates && formik.errors.coordinates ? "border-red-500" : ""}`} />
        {geocodingStatus && <p className="text-[10px] text-zinc-550 font-semibold animate-pulse mt-1">{geocodingStatus}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Venue Location Map Preview</Label>
        <OSMMapPicker lat={getMapCoords().lat} lon={getMapCoords().lon} city={formik.values.city} district={formik.values.district} onChange={handleMapChange} height="200px" />
        {formik.values.locationMapLink && <p className="text-[10px] text-zinc-400 font-medium truncate mt-1">Generated Link: <span className="font-mono">{formik.values.locationMapLink}</span></p>}
      </div>
    </>
  );
}
