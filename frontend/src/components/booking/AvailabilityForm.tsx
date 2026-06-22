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

export type AvailabilityValues = {
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
};

type Props = {
  formik: FormikProps<AvailabilityValues>;
  photographerFirstName: string;
  availabilityError: string;
  today: string;
};

export function AvailabilityForm({
  formik,
  photographerFirstName,
  availabilityError,
  today,
}: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Check Availability</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Pick your preferred date and time to see if {photographerFirstName} is
          free.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          {availabilityError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-650 dark:text-red-400 border border-red-250/20">
              {availabilityError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Date</Label>
            <Input
              id="date"
              type="date"
              min={today}
              {...formik.getFieldProps("date")}
              className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                formik.touched.date && formik.errors.date
                  ? "border-red-500"
                  : ""
              }`}
            />
            <FieldError
              msg={formik.touched.date ? formik.errors.date : undefined}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...formik.getFieldProps("startTime")}
                className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.startTime && formik.errors.startTime
                    ? "border-red-500"
                    : ""
                }`}
              />
              <FieldError
                msg={
                  formik.touched.startTime ? formik.errors.startTime : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...formik.getFieldProps("endTime")}
                className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.endTime && formik.errors.endTime
                    ? "border-red-500"
                    : ""
                }`}
              />
              <FieldError
                msg={
                  formik.touched.endTime ? formik.errors.endTime : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Event Type</Label>
            <Input
              id="eventType"
              placeholder="e.g. Wedding, Portrait, Corporate Event"
              {...formik.getFieldProps("eventType")}
              className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                formik.touched.eventType && formik.errors.eventType
                  ? "border-red-500"
                  : ""
              }`}
            />
            <FieldError
              msg={
                formik.touched.eventType ? formik.errors.eventType : undefined
              }
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none shadow-sm"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Checking..." : "Check Availability"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
