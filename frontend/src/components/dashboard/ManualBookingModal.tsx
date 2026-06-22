import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";

export type ManualBookingValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location: string;
  notes: string;
};

type Props = {
  formik: FormikProps<ManualBookingValues>;
  onClose: () => void;
};

export function ManualBookingModal({ formik, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Log Offline / Manual Booking
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400">
            Cancel
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-firstName">Client First Name</Label>
              <Input id="mb-firstName" {...formik.getFieldProps("firstName")} />
              <FieldError msg={formik.touched.firstName ? formik.errors.firstName : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-lastName">Client Last Name</Label>
              <Input id="mb-lastName" {...formik.getFieldProps("lastName")} />
              <FieldError msg={formik.touched.lastName ? formik.errors.lastName : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-email">Email</Label>
              <Input id="mb-email" type="email" {...formik.getFieldProps("email")} />
              <FieldError msg={formik.touched.email ? formik.errors.email : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-phone">Phone</Label>
              <Input id="mb-phone" {...formik.getFieldProps("phone")} />
              <FieldError msg={formik.touched.phone ? formik.errors.phone : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-date">Date</Label>
              <Input id="mb-date" type="date" {...formik.getFieldProps("date")} />
              <FieldError msg={formik.touched.date ? formik.errors.date : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-startTime">Start Time</Label>
              <Input id="mb-startTime" type="time" {...formik.getFieldProps("startTime")} />
              <FieldError msg={formik.touched.startTime ? formik.errors.startTime : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-endTime">End Time</Label>
              <Input id="mb-endTime" type="time" {...formik.getFieldProps("endTime")} />
              <FieldError msg={formik.touched.endTime ? formik.errors.endTime : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-eventType">Event Type</Label>
              <Input id="mb-eventType" placeholder="e.g. Wedding, Portrait" {...formik.getFieldProps("eventType")} />
              <FieldError msg={formik.touched.eventType ? formik.errors.eventType : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-location">Location</Label>
              <Input id="mb-location" placeholder="e.g. Colombo 03" {...formik.getFieldProps("location")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mb-notes">Notes / Special requests</Label>
            <textarea
              id="mb-notes"
              rows={2}
              {...formik.getFieldProps("notes")}
              className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="border-t pt-4 mt-6 flex justify-end gap-2 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Book Event</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
