import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/feedback/FieldError";
import { NominatimSelect } from "@/components/maps/NominatimSelect";
import { type LocationPickerFormValues } from "../LocationPickerFormFields";

type Props<T extends LocationPickerFormValues> = {
  formik: FormikProps<T>;
  isRequired: boolean;
  onNominatimSelect: (city: string, district: string) => Promise<void>;
  hasError: boolean;
};

export function LocationPickerCityDistrict<T extends LocationPickerFormValues>({ formik, isRequired, onNominatimSelect, hasError }: Props<T>) {
  return (
    <div className="space-y-2">
      <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
        City &amp; District {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <NominatimSelect
        cityValue={formik.values.city}
        districtValue={formik.values.district}
        onSelect={onNominatimSelect}
        error={hasError ? "Error" : undefined}
      />
      <FieldError msg={hasError ? ((formik.errors as any).city || (formik.errors as any).district) : undefined} />
    </div>
  );
}
