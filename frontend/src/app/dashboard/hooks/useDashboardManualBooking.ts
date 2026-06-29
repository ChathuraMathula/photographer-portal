"use client";

import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import { type ManualBookingValues } from "@/components/dashboard/ManualBookingModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const ManualBookingSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[0-9\s-]{7,15}$/, "Please enter a valid phone number"),
  date: Yup.string()
    .required("Date is required")
    .test("not-past", "Date cannot be in the past", function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(value);
      selected.setHours(0, 0, 0, 0);
      return selected >= today;
    }),
  startTime: Yup.string()
    .required("Start time is required")
    .test("not-past-time", "Start time cannot be in the past", function (value) {
      if (!value) return false;
      const { date } = this.parent;
      if (!date) return true;
      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA");
      if (date === todayStr) {
        const currentTime = today.toTimeString().slice(0, 5); // "HH:MM"
        return value >= currentTime;
      }
      return true;
    }),
  endTime: Yup.string()
    .required("End time is required")
    .test("after-start", "End time must be after start time", function (v) {
      return !v || v > this.parent.startTime;
    }),
  eventType: Yup.string().required("Event type is required"),
  location: Yup.string().test(
    "venue-required",
    "Venue is required if map link is not provided",
    function (value) {
      const { locationMapLink } = this.parent;
      return !!(value?.trim() || locationMapLink?.trim());
    }
  ),
  city: Yup.string().test(
    "city-required",
    "City is required if map link is not provided",
    function (value) {
      const { locationMapLink } = this.parent;
      return !!(value?.trim() || locationMapLink?.trim());
    }
  ),
  district: Yup.string().test(
    "district-required",
    "District is required if map link is not provided",
    function (value) {
      const { locationMapLink } = this.parent;
      return !!(value?.trim() || locationMapLink?.trim());
    }
  ),
  locationMapLink: Yup.string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .test(
      "at-least-one-location-link",
      "Either Venue details or Google Maps link is required",
      function (value) {
        const { location, city, district } = this.parent;
        return !!(value?.trim() || (location?.trim() && city?.trim() && district?.trim()));
      }
    ),
  notes: Yup.string().optional().nullable(),
  packageId: Yup.string().optional().nullable(),
  advancePaymentLkr: Yup.number().typeError("Must be a number").min(0, "Cannot be negative").optional().nullable(),
  totalAmountLkr: Yup.number().typeError("Must be a number").min(0, "Cannot be negative").optional().nullable(),
});

interface UseDashboardManualBookingProps {
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  loadPhotographerData: () => Promise<void>;
  setShowManualModal: (show: boolean) => void;
}

export function useDashboardManualBooking({
  authFetch,
  loadPhotographerData,
  setShowManualModal,
}: UseDashboardManualBookingProps) {
  const manualFormik = useFormik<ManualBookingValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      date: "",
      startTime: "",
      endTime: "",
      eventType: "",
      location: "",
      city: "",
      district: "",
      locationMapLink: "",
      notes: "",
      packageId: "",
      advancePaymentLkr: "",
      totalAmountLkr: "",
    },
    validationSchema: ManualBookingSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          eventType: values.eventType,
          location: values.location || undefined,
          city: values.city || undefined,
          district: values.district || undefined,
          locationMapLink: values.locationMapLink || undefined,
          notes: values.notes || undefined,
          packageId: values.packageId || undefined,
          advancePaymentPriceInCents: values.advancePaymentLkr
            ? Math.round(Number(values.advancePaymentLkr) * 100)
            : undefined,
          totalAmountInCents: values.totalAmountLkr
            ? Math.round(Number(values.totalAmountLkr) * 100)
            : undefined,
        };

        const res = await authFetch(`${API}/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to book manual reservation");
        setShowManualModal(false);
        resetForm();
        await loadPhotographerData();
        toast.success("Manual offline booking registered successfully!");
      } catch (err: any) {
        toast.error(err.message || "Manual booking failed");
      }
    },
  });

  return {
    manualFormik,
  };
}
