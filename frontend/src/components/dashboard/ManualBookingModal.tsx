import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { X } from "lucide-react";
import { NominatimSelect } from "@/components/common/NominatimSelect";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { TimeSelect } from "@/components/booking/TimeSelect";
import { EventTypeSelect } from "@/components/booking/EventTypeSelect";
import { type Package } from "@/types";

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
  city: string;
  district: string;
  locationMapLink: string;
  notes: string;
  packageId: string;
  advancePaymentLkr: string | number;
  totalAmountLkr: string | number;
};

type Props = {
  formik: FormikProps<ManualBookingValues>;
  onClose: () => void;
  allowedEventTypes?: string[];
  allowCustomEventTypes?: boolean;
  packages?: Package[];
  universalDepositType?: string;
  universalDepositValue?: number;
};

export function ManualBookingModal({
  formik,
  onClose,
  allowedEventTypes = [],
  allowCustomEventTypes = true,
  packages = [],
  universalDepositType = "fixed",
  universalDepositValue = 5000,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <form
        onSubmit={formik.handleSubmit}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
            Log Offline / Manual Booking
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
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

          {/* Date Picker using client flow style */}
          <div className="space-y-2">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Date</Label>
            <CalendarPicker
              value={formik.values.date}
              onChange={(val) => formik.setFieldValue("date", val)}
              today={today}
              error={formik.touched.date ? formik.errors.date : undefined}
            />
          </div>

          {/* Time Picker using client flow style */}
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

          {/* Event Type select and Location inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Event Type</Label>
              <EventTypeSelect
                value={formik.values.eventType}
                onChange={(val) => formik.setFieldValue("eventType", val)}
                allowedEventTypes={allowedEventTypes}
                allowCustomEventTypes={allowCustomEventTypes}
                error={formik.touched.eventType ? formik.errors.eventType : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-location" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Venue / Location <span className="text-red-500">*</span></Label>
              <Input
                id="mb-location"
                placeholder="e.g. Cinnamon Grand"
                {...formik.getFieldProps("location")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.location ? formik.errors.location : undefined} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              City &amp; District <span className="text-red-500">*</span>
            </Label>
            <NominatimSelect
              cityValue={formik.values.city}
              districtValue={formik.values.district}
              onSelect={(city, district) => {
                formik.setFieldValue("city", city);
                formik.setFieldValue("district", district);
              }}
              error={(formik.touched.city && formik.errors.city) || (formik.touched.district && formik.errors.district) ? "Error" : undefined}
            />
            <FieldError
              msg={(formik.touched.city && formik.errors.city) || (formik.touched.district && formik.errors.district) ? (formik.errors.city || formik.errors.district) : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-locationMapLink" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Google Maps Location Link (optional)</Label>
              <Input
                id="mb-locationMapLink"
                placeholder="e.g. https://maps.google.com/?q=..."
                {...formik.getFieldProps("locationMapLink")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.locationMapLink ? formik.errors.locationMapLink : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-packageId" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Package (optional)</Label>
              <select
                id="mb-packageId"
                value={formik.values.packageId}
                onChange={(e) => {
                  const val = e.target.value;
                  formik.setFieldValue("packageId", val);
                  if (val) {
                    const selected = packages.find((p) => p.id === val);
                    if (selected) {
                      const priceLkr = selected.priceInCents / 100;
                      formik.setFieldValue("totalAmountLkr", priceLkr);
                      let depositLkr = 0;
                      const depType = selected.depositType || "universal";
                      if (depType === "fixed") {
                        depositLkr = (selected.depositValue ?? 0) / 100;
                      } else if (depType === "percentage") {
                        depositLkr = (priceLkr * (selected.depositValue ?? 0)) / 100;
                      } else {
                        if (universalDepositType === "fixed") {
                          depositLkr = universalDepositValue;
                        } else {
                          depositLkr = (priceLkr * universalDepositValue) / 100;
                        }
                      }
                      formik.setFieldValue("advancePaymentLkr", Math.round(depositLkr));
                    }
                  } else {
                    formik.setFieldValue("totalAmountLkr", "");
                    formik.setFieldValue("advancePaymentLkr", "");
                  }
                }}
                className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-body-small text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all"
              >
                <option value="">-- No Package --</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} (LKR {(pkg.priceInCents / 100).toLocaleString()})
                  </option>
                ))}
              </select>
              <FieldError msg={formik.touched.packageId ? formik.errors.packageId : undefined} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mb-totalAmountLkr" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Total Price (LKR)</Label>
              <Input
                id="mb-totalAmountLkr"
                type="number"
                placeholder="e.g. 25000"
                {...formik.getFieldProps("totalAmountLkr")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.totalAmountLkr ? formik.errors.totalAmountLkr : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mb-advancePaymentLkr" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Advance Paid (LKR)</Label>
              <Input
                id="mb-advancePaymentLkr"
                type="number"
                placeholder="e.g. 5000"
                {...formik.getFieldProps("advancePaymentLkr")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.advancePaymentLkr ? formik.errors.advancePaymentLkr : undefined} />
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
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
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
  );
}
