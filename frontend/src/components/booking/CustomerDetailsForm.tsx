import React from "react";
import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type AvailabilityValues } from "./AvailabilityForm";
import { CustomerDetailsNameFields } from "./components/CustomerDetailsNameFields";
import { CustomerDetailsContactFields } from "./components/CustomerDetailsContactFields";
import { CustomerDetailsLocationFields } from "./components/CustomerDetailsLocationFields";

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
          {availabilityChecked.date} · {availabilityChecked.startTime}–{availabilityChecked.endTime} ·{" "}
          {availabilityChecked.eventType} ·{" "}
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

          <CustomerDetailsNameFields formik={formik} />
          <CustomerDetailsContactFields formik={formik} />
          <CustomerDetailsLocationFields formik={formik} />
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button type="button" className="btn btn-secondary flex-1 min-w-0 md:min-w-0 h-11 py-0 shadow-sm" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="btn btn-primary flex-1 min-w-0 md:min-w-0 h-11 py-0 shadow-sm" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
