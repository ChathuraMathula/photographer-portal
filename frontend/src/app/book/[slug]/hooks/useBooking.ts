"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import { type PhotographerProfile } from "@/types";
import { type AvailabilityValues } from "@/components/booking/AvailabilityForm";
import { AvailabilitySchema, DetailsSchema } from "../schemas/bookingSchemas";
import { useBookingSocket } from "./useBookingSocket";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type Step = "availability" | "details" | "confirmed";

export function useBooking() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [pageState, setPageState] = useState<"loading" | "ready" | "not-found">(
    "loading",
  );
  const [step, setStep] = useState<Step>("availability");
  const [availabilityChecked, setAvailabilityChecked] =
    useState<AvailabilityValues | null>(null);
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

  useBookingSocket(slug, setProfile);

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
        setAvailabilityError("This time slot is not available. Please try another.");
      }
    },
  });

  const detailsFormik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      city: "",
      district: "",
      locationMapLink: "",
      coordinates: "",
      notes: "",
    },
    validationSchema: DetailsSchema,
    onSubmit: async (values, { setStatus }) => {
      if (!availabilityChecked) return;
      const { coordinates, ...payload } = values;
      const res = await fetch(`${API}/bookings/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...availabilityChecked }),
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
