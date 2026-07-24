import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { type PackageFormValues } from "@/components/modals/PackageFormModal";

type Props = {
  formik: FormikProps<PackageFormValues>;
  includesText: string;
  onIncludesChange: (v: string) => void;
};

export function PackageFormBasicInfo({
  formik,
  includesText,
  onIncludesChange,
}: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="pkg-name"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Package Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pkg-name"
          placeholder="e.g. Bronze Portrait Package"
          {...formik.getFieldProps("name")}
          className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.name && formik.errors.name ? "border-red-500" : ""}`}
        />
        <FieldError
          msg={formik.touched.name ? formik.errors.name : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="pkg-description"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Description <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="pkg-description"
          rows={2}
          placeholder="Describe details, deliverables..."
          {...formik.getFieldProps("description")}
          className={`w-full rounded-xl border bg-white p-2.5 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all ${formik.touched.description && formik.errors.description ? "border-red-500" : "border-zinc-200"}`}
        />
        <FieldError
          msg={
            formik.touched.description ? formik.errors.description : undefined
          }
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="pkg-includes"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Included Items{" "}
          <span className="text-zinc-400 font-normal">(comma separated)</span>
        </Label>
        <Input
          id="pkg-includes"
          placeholder="e.g. 1 Hour coverage, 15 edited photos, raw images"
          value={includesText}
          onChange={(e) => onIncludesChange(e.target.value)}
          className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
        />
        <p className="text-body-caption text-zinc-455 mt-1 pl-1">
          Separate items by comma.
        </p>
      </div>
    </>
  );
}
