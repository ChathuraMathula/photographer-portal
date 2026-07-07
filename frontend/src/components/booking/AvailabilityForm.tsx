import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPicker } from "./CalendarPicker";
import { TimeSelect } from "./TimeSelect";
import { EventTypeSelect } from "./EventTypeSelect";

export type AvailabilityValues = { date: string; startTime: string; endTime: string; eventType: string; };

type Props = { formik: FormikProps<AvailabilityValues>; photographerFirstName: string; availabilityError: string; today: string; allowedEventTypes?: string[]; allowCustomEventTypes?: boolean; };

export function AvailabilityForm({ formik, photographerFirstName, availabilityError, today, allowedEventTypes = [], allowCustomEventTypes = true }: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900 rounded-xl overflow-visible">
      <CardHeader>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Check Availability</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">Pick your preferred date and time to see if {photographerFirstName} is free.</CardDescription>
      </CardHeader>
      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-5">
          {availabilityError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-250/20">{availabilityError}</div>
          )}
          <div className="space-y-2">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Date</Label>
            <CalendarPicker value={formik.values.date} onChange={(val) => formik.setFieldValue("date", val)} today={today} error={formik.touched.date ? formik.errors.date : undefined} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Start Time</Label>
              <TimeSelect value={formik.values.startTime} onChange={(val) => formik.setFieldValue("startTime", val)} placeholder="Select start" error={formik.touched.startTime ? formik.errors.startTime : undefined} />
            </div>
            <div className="space-y-2">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">End Time</Label>
              <TimeSelect value={formik.values.endTime} onChange={(val) => formik.setFieldValue("endTime", val)} placeholder="Select end" startTimeFilter={formik.values.startTime} error={formik.touched.endTime ? formik.errors.endTime : undefined} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Event Type</Label>
            <EventTypeSelect value={formik.values.eventType} onChange={(val) => formik.setFieldValue("eventType", val)} allowedEventTypes={allowedEventTypes} allowCustomEventTypes={allowCustomEventTypes} error={formik.touched.eventType ? formik.errors.eventType : undefined} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="btn btn-primary w-full h-[50px] py-0 min-w-0 max-w-none md:max-w-none shadow-sm" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Checking..." : "Check Availability"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
