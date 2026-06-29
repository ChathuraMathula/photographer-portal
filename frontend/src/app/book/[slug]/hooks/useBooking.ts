"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { io } from "socket.io-client";

import { type PhotographerProfile } from "@/types";
import { type AvailabilityValues } from "@/components/booking/AvailabilityForm";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type Step = "availability" | "details" | "confirmed";

const AvailabilitySchema = Yup.object({
  date: Yup.string()
    .required("Date is required")
    .test("not-past", "Date must be in the future (tomorrow or later)", function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(value);
      selected.setHours(0, 0, 0, 0);
      return selected > today;
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
      return !!v && v > this.parent.startTime;
    }),
  eventType: Yup.string().required("Event type is required"),
});

const DetailsSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[0-9\s-]{7,15}$/, "Please enter a valid phone number"),
  location: Yup.string().required("Venue / Location address is required"),
  city: Yup.string().required("City is required"),
  district: Yup.string().required("District is required"),
  locationMapLink: Yup.string().url("Must be a valid URL").required("Map pin location is required"),
  notes: Yup.string(),
});

export function useBooking() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [pageState, setPageState] = useState<"loading" | "ready" | "not-found">("loading");
  const [step, setStep] = useState<Step>("availability");
  const [availabilityChecked, setAvailabilityChecked] = useState<AvailabilityValues | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/bookings/${slug}`)
      .then((r) => {
        if (!r.ok) {
          setPageState("not-found");
          return null;
        }
        return r.json() as Promise<PhotographerProfile>;
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          setPageState("ready");
        }
      })
      .catch(() => setPageState("not-found"));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const socket = io(API);
    socket.emit("joinBooking", { bookingSlug: slug });

    socket.on("profileUpdated", (updatedProfile: PhotographerProfile) => {
      console.log("⚡ Real-time profile update received:", updatedProfile);
      setProfile((prev) => {
        if (!prev) return updatedProfile;
        return {
          ...prev,
          ...updatedProfile,
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [slug]);

  const availabilityFormik = useFormik<AvailabilityValues>({
    initialValues: { date: "", startTime: "", endTime: "", eventType: "" },
    validationSchema: AvailabilitySchema,
    onSubmit: async (values) => {
      setAvailabilityError("");
      const qs = new URLSearchParams({
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
      });
      const res = await fetch(`${API}/bookings/${slug}/availability?${qs}`);
      const data = await res.json();
      if (data.available) {
        setAvailabilityChecked(values);
        setStep("details");
      } else {
        setAvailabilityError(data.reason ?? "This time slot is not available. Please try another.");
      }
    },
  });

  const detailsFormik = useFormik({
    initialValues: { firstName: "", lastName: "", email: "", phone: "", location: "", city: "", district: "", locationMapLink: "", notes: "" },
    validationSchema: DetailsSchema,
    onSubmit: async (values, { setStatus }) => {
      if (!availabilityChecked) return;
      const res = await fetch(`${API}/bookings/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...availabilityChecked }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.message ?? "Submission failed");
        return;
      }
      setTrackingToken(data.reservationToken);
      setStep("confirmed");
    },
  });

  const today = new Date().toISOString().split("T")[0];

  return {
    slug,
    profile,
    pageState,
    step,
    setStep,
    availabilityChecked,
    availabilityError,
    setAvailabilityError,
    trackingToken,
    origin,
    availabilityFormik,
    detailsFormik,
    today,
  };
}
