import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { type ManualBookingValues } from "@/components/modals/ManualBookingModal";

type Props = {
  formik: FormikProps<ManualBookingValues>;
};

export function ManualBookingClientFields({ formik }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="mb-firstName"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Client First Name
          </Label>
          <Input
            id="mb-firstName"
            {...formik.getFieldProps("firstName")}
            className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.firstName && formik.errors.firstName ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.firstName ? formik.errors.firstName : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="mb-lastName"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Client Last Name
          </Label>
          <Input
            id="mb-lastName"
            {...formik.getFieldProps("lastName")}
            className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.lastName && formik.errors.lastName ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.lastName ? formik.errors.lastName : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="mb-email"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Email
          </Label>
          <Input
            id="mb-email"
            type="email"
            {...formik.getFieldProps("email")}
            className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.email ? formik.errors.email : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="mb-phone"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Phone
          </Label>
          <Input
            id="mb-phone"
            {...formik.getFieldProps("phone")}
            className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.phone && formik.errors.phone ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.phone ? formik.errors.phone : undefined}
          />
        </div>
      </div>
    </>
  );
}
