import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/feedback/FieldError";
import { OSMMapPicker } from "@/components/maps/OSMMapPicker";
import { type LocationPickerFormValues } from "../LocationPickerFormFields";

type Props<T extends LocationPickerFormValues> = {
  formik: FormikProps<T>;
  isRequired: boolean;
  onMapPickerChange: (lat: number, lon: number) => Promise<void>;
};

export function LocationPickerMapPreview<T extends LocationPickerFormValues>({
  formik,
  isRequired,
  onMapPickerChange,
}: Props<T>) {
  return (
    <div className="space-y-2">
      <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
        Venue Location Map Preview{" "}
        {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <OSMMapPicker
        lat={
          formik.values.locationMapLink
            ? parseFloat(
                formik.values.locationMapLink.match(
                  /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
                )?.[1] || "",
              ) || undefined
            : undefined
        }
        lon={
          formik.values.locationMapLink
            ? parseFloat(
                formik.values.locationMapLink.match(
                  /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
                )?.[2] || "",
              ) || undefined
            : undefined
        }
        city={formik.values.city}
        district={formik.values.district}
        onChange={onMapPickerChange}
        height="250px"
      />
      {formik.values.locationMapLink && (
        <p className="text-[10px] text-zinc-400 font-medium truncate mt-1">
          Generated Coordinates Link:{" "}
          <span className="text-zinc-650 dark:text-zinc-400 font-mono">
            {formik.values.locationMapLink}
          </span>
        </p>
      )}
      <FieldError
        msg={
          (formik.touched as any).locationMapLink
            ? (formik.errors as any).locationMapLink
            : undefined
        }
      />
    </div>
  );
}
