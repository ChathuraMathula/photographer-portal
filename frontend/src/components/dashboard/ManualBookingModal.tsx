import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { X } from "lucide-react";

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
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Header with Background & Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm dark:border-zinc-800">
          <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
            Log Offline / Manual Booking
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-firstName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Client First Name</Label>
              <Input
                id="mb-firstName"
                {...formik.getFieldProps("firstName")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.firstName ? formik.errors.firstName : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-lastName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Client Last Name</Label>
              <Input
                id="mb-lastName"
                {...formik.getFieldProps("lastName")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.lastName ? formik.errors.lastName : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-email" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Email</Label>
              <Input
                id="mb-email"
                type="email"
                {...formik.getFieldProps("email")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.email ? formik.errors.email : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-phone" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Phone</Label>
              <Input
                id="mb-phone"
                {...formik.getFieldProps("phone")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.phone ? formik.errors.phone : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-date" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Date</Label>
              <Input
                id="mb-date"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                {...formik.getFieldProps("date")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.date ? formik.errors.date : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-startTime" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Start Time</Label>
              <Input
                id="mb-startTime"
                type="time"
                {...formik.getFieldProps("startTime")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.startTime ? formik.errors.startTime : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-endTime" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">End Time</Label>
              <Input
                id="mb-endTime"
                type="time"
                {...formik.getFieldProps("endTime")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.endTime ? formik.errors.endTime : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-eventType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Event Type</Label>
              <Input
                id="mb-eventType"
                placeholder="e.g. Wedding, Portrait"
                {...formik.getFieldProps("eventType")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.eventType ? formik.errors.eventType : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-location" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Location</Label>
              <Input
                id="mb-location"
                placeholder="e.g. Colombo 03"
                {...formik.getFieldProps("location")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mb-notes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Notes / Special requests</Label>
            <textarea
              id="mb-notes"
              rows={2}
              {...formik.getFieldProps("notes")}
              className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
          </div>

          {/* Sticky Footer inside the flex form */}
          <div className="sticky bottom-0 z-10 border-t px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm -mx-6 -mb-6 mt-6 dark:border-zinc-800 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="btn btn-secondary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn btn-primary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
            >
              Book Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
