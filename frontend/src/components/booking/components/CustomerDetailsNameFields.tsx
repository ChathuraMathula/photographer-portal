import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { type CustomerDetailsValues } from "../CustomerDetailsForm";

type Props = {
  formik: FormikProps<CustomerDetailsValues>;
};

export function CustomerDetailsNameFields({ formik }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label
          htmlFor="firstName"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          First Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="firstName"
          placeholder="John"
          {...formik.getFieldProps("firstName")}
          className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
            formik.touched.firstName && formik.errors.firstName
              ? "border-red-500"
              : ""
          }`}
        />
        <FieldError
          msg={formik.touched.firstName ? formik.errors.firstName : undefined}
        />
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="lastName"
          className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
        >
          Last Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lastName"
          placeholder="Doe"
          {...formik.getFieldProps("lastName")}
          className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
            formik.touched.lastName && formik.errors.lastName
              ? "border-red-500"
              : ""
          }`}
        />
        <FieldError
          msg={formik.touched.lastName ? formik.errors.lastName : undefined}
        />
      </div>
    </div>
  );
}
