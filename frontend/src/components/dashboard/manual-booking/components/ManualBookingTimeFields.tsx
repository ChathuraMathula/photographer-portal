import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { TimeSelect } from "@/components/booking/TimeSelect";
import { type ManualBookingValues } from "../../ManualBookingModal";

type Props = {
  formik: FormikProps<ManualBookingValues>;
};

export function ManualBookingTimeFields({ formik }: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="space-y-2">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Date</Label>
        <CalendarPicker
          value={formik.values.date}
          onChange={(val) => formik.setFieldValue("date", val)}
          today={today}
          error={formik.touched.date ? formik.errors.date : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Start Time</Label>
          <TimeSelect
            value={formik.values.startTime}
            onChange={(val) => formik.setFieldValue("startTime", val)}
            placeholder="Select start"
            error={formik.touched.startTime ? formik.errors.startTime : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">End Time</Label>
          <TimeSelect
            value={formik.values.endTime}
            onChange={(val) => formik.setFieldValue("endTime", val)}
            placeholder="Select end"
            startTimeFilter={formik.values.startTime}
            error={formik.touched.endTime ? formik.errors.endTime : undefined}
          />
        </div>
      </div>
    </>
  );
}
