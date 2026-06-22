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
    <Card>
      <CardHeader>
        <CardTitle>Check Availability</CardTitle>
        <CardDescription>
          Pick your preferred date and time to see if {photographerFirstName} is
          free.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          {availabilityError && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-600 dark:bg-red-900/30">
              {availabilityError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              min={today}
              {...formik.getFieldProps("date")}
              className={
                formik.touched.date && formik.errors.date
                  ? "border-red-500"
                  : ""
              }
            />
            <FieldError
              msg={formik.touched.date ? formik.errors.date : undefined}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...formik.getFieldProps("startTime")}
                className={
                  formik.touched.startTime && formik.errors.startTime
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.startTime ? formik.errors.startTime : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...formik.getFieldProps("endTime")}
                className={
                  formik.touched.endTime && formik.errors.endTime
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.endTime ? formik.errors.endTime : undefined
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Input
              id="eventType"
              placeholder="e.g. Wedding, Portrait, Corporate Event"
              {...formik.getFieldProps("eventType")}
              className={
                formik.touched.eventType && formik.errors.eventType
                  ? "border-red-500"
                  : ""
              }
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
            className="w-full"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Checking..." : "Check Availability"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
