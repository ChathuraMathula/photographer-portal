import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { LocationPickerFormFields } from "@/components/maps/LocationPickerFormFields";
import { type CustomerDetailsValues } from "../CustomerDetailsForm";

type Props = {
  formik: FormikProps<CustomerDetailsValues>;
};

export function CustomerDetailsLocationFields({ formik }: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="location"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Venue / Location <span className="text-red-500">*</span>{" "}
          <span className="text-[10px] text-zinc-400 font-normal">
            (Either Venue details or Maps Link is required)
          </span>
        </Label>
        <Input
          id="location"
          placeholder="e.g. Cinnamon Grand, Colombo"
          {...formik.getFieldProps("location")}
          className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
            formik.touched.location && formik.errors.location
              ? "border-red-500"
              : ""
          }`}
        />
        <FieldError
          msg={formik.touched.location ? formik.errors.location : undefined}
        />
      </div>

      <LocationPickerFormFields formik={formik as any} isRequired={true} />

      <div className="space-y-2">
        <Label
          htmlFor="notes"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Notes <span className="text-zinc-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="notes"
          placeholder="Any special requirements..."
          {...formik.getFieldProps("notes")}
          className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
        />
      </div>
    </>
  );
}
