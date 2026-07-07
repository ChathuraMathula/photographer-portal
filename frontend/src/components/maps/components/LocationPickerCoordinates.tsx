import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { type LocationPickerFormValues } from "../LocationPickerFormFields";

type Props<T extends LocationPickerFormValues> = {
  formik: FormikProps<T>;
  geocodingStatus: string | null;
  onCoordinatesChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
};

export function LocationPickerCoordinates<T extends LocationPickerFormValues>({
  formik,
  geocodingStatus,
  onCoordinatesChange,
}: Props<T>) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor="coordinates"
        className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
      >
        Coordinates{" "}
        <span className="text-zinc-400 font-normal">
          (optional, e.g. 7.2905715, 80.6337262)
        </span>
      </Label>
      <Input
        id="coordinates"
        placeholder="Paste exact coordinates (latitude, longitude)..."
        value={formik.values.coordinates || ""}
        onChange={onCoordinatesChange as any}
        className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
      />
      {geocodingStatus && (
        <p className="text-[10px] text-zinc-550 dark:text-zinc-400 font-semibold animate-pulse mt-1">
          {geocodingStatus}
        </p>
      )}
      <FieldError
        msg={
          (formik.touched as any).coordinates
            ? (formik.errors as any).coordinates
            : undefined
        }
      />

      {formik.values.coordinates ? (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-medium border border-emerald-100 dark:border-emerald-900/30">
          📍 Pinning exact coordinates. The map preview shows your exact venue
          location.
        </div>
      ) : formik.values.city || formik.values.district ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-xs rounded-xl font-medium border border-blue-100 dark:border-blue-900/30">
          ℹ️ No coordinates provided. The preview map shows the center of the
          selected city/district. We recommend pinning the exact location on the
          map picker or entering coordinates.
        </div>
      ) : null}
    </div>
  );
}
