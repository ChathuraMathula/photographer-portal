import React from "react";
import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/common/FieldError";
import { type AvailabilityValues } from "./AvailabilityForm";
import { LocationPickerFormFields } from "@/components/common/LocationPickerFormFields";

export type CustomerDetailsValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  district: string;
  locationMapLink: string;
  coordinates: string;
  notes: string;
};

type Props = {
  formik: FormikProps<CustomerDetailsValues>;
  availabilityChecked: AvailabilityValues;
  onBack: () => void;
};

export function CustomerDetailsForm({ formik, availabilityChecked, onBack }: Props) {

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Your Details</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          {availabilityChecked.date} · {availabilityChecked.startTime}–
          {availabilityChecked.endTime} · {availabilityChecked.eventType} ·{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Available</span>
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          {formik.status && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-250/20">
              {formik.status}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
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
                msg={
                  formik.touched.firstName ? formik.errors.firstName : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
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
                msg={
                  formik.touched.lastName ? formik.errors.lastName : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...formik.getFieldProps("email")}
              className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : ""
              }`}
            />
            <FieldError
              msg={formik.touched.email ? formik.errors.email : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+94 77 123 4567"
              {...formik.getFieldProps("phone")}
              className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                formik.touched.phone && formik.errors.phone
                  ? "border-red-500"
                  : ""
              }`}
            />
            <FieldError
              msg={formik.touched.phone ? formik.errors.phone : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Venue / Location <span className="text-red-500">*</span> <span className="text-[10px] text-zinc-400 font-normal">(Either Venue details or Maps Link is required)</span>
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
            <Label htmlFor="notes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Notes <span className="text-zinc-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="notes"
              placeholder="Any special requirements..."
              {...formik.getFieldProps("notes")}
              className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            className="btn btn-secondary flex-1 min-w-0 md:min-w-0 h-11 py-0 shadow-sm"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="btn btn-primary flex-1 min-w-0 md:min-w-0 h-11 py-0 shadow-sm"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
