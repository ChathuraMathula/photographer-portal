import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { type CustomerDetailsValues } from "../CustomerDetailsForm";

type Props = {
  formik: FormikProps<CustomerDetailsValues>;
};

export function CustomerDetailsContactFields({ formik }: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...formik.getFieldProps("email")}
          className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
            formik.touched.email && formik.errors.email ? "border-red-500" : ""
          }`}
        />
        <FieldError
          msg={formik.touched.email ? formik.errors.email : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="phone"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Phone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+94 77 123 4567"
          {...formik.getFieldProps("phone")}
          className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
            formik.touched.phone && formik.errors.phone ? "border-red-500" : ""
          }`}
        />
        <FieldError
          msg={formik.touched.phone ? formik.errors.phone : undefined}
        />
      </div>
    </>
  );
}
