"use client";

import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import { type ManualBookingValues } from "@/components/modals/ManualBookingModal";

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
    .test(
      "not-past-time",
      "Start time cannot be in the past",
      function (value) {
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
      },
    ),
  endTime: Yup.string()
    .required("End time is required")
    .test("after-start", "End time must be after start time", function (v) {
      return !v || v > this.parent.startTime;
    }),
  eventType: Yup.string().required("Event type is required"),
  location: Yup.string().required("Venue / Location address is required"),
  city: Yup.string().required("City is required"),
  district: Yup.string().required("District is required"),
  locationMapLink: Yup.string()
    .url("Must be a valid URL")
    .required("Map pin location is required"),
  coordinates: Yup.string()
    .nullable()
    .optional()
    .test(
      "valid-coords",
      "Invalid coordinates. Format: 'latitude, longitude' (e.g. 7.2905, 80.6337)",
      (val) => {
        if (!val) return true;
        const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
        if (!match) return false;
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
      },
    ),
  notes: Yup.string().optional().nullable(),
  packageId: Yup.string().optional().nullable(),
  advancePaymentLkr: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .optional()
    .nullable(),
  totalAmountLkr: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .optional()
    .nullable(),
});

interface UseDashboardManualBookingProps {
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
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
      coordinates: "",
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
        if (!res.ok)
          throw new Error(data.message || "Failed to book manual reservation");
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
