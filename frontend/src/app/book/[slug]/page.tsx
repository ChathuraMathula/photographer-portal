"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

import { type PhotographerProfile } from "@/types";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PhotographerHeader } from "@/components/booking/PhotographerHeader";
import {
  AvailabilityForm,
  type AvailabilityValues,
} from "@/components/booking/AvailabilityForm";
import { CustomerDetailsForm } from "@/components/booking/CustomerDetailsForm";
import { BookingConfirmed } from "@/components/booking/BookingConfirmed";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API = "http://localhost:3000";

// ── Validation schemas ────────────────────────────────────────────────────────

const AvailabilitySchema = Yup.object({
  date: Yup.string().required("Date is required"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string()
    .required("End time is required")
    .test("after-start", "End time must be after start time", function (v) {
      return !!v && v > this.parent.startTime;
    }),
  eventType: Yup.string().required("Event type is required"),
});

const DetailsSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string().required("Required"),
  location: Yup.string(),
  notes: Yup.string(),
});

// ── Page ──────────────────────────────────────────────────────────────────────

type Step = "availability" | "details" | "confirmed";

export default function BookingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [pageState, setPageState] = useState<"loading" | "ready" | "not-found">("loading");
  const [step, setStep] = useState<Step>("availability");
  const [availabilityChecked, setAvailabilityChecked] = useState<AvailabilityValues | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/bookings/${slug}`)
      .then((r) => {
        if (!r.ok) { setPageState("not-found"); return null; }
        return r.json() as Promise<PhotographerProfile>;
      })
      .then((data) => {
        if (data) { setProfile(data); setPageState("ready"); }
      })
      .catch(() => setPageState("not-found"));
  }, [slug]);

  // ── Step 1: availability check ─────────────────────────────────────────────

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

  // ── Step 2: customer details ───────────────────────────────────────────────

  const detailsFormik = useFormik({
    initialValues: { firstName: "", lastName: "", email: "", phone: "", location: "", notes: "" },
    validationSchema: DetailsSchema,
    onSubmit: async (values, { setStatus }) => {
      if (!availabilityChecked) return;
      const res = await fetch(`${API}/bookings/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...availabilityChecked }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(data.message ?? "Submission failed"); return; }
      setTrackingToken(data.reservationToken);
      setStep("confirmed");
    },
  });

  // ── Render states ──────────────────────────────────────────────────────────

  if (pageState === "loading") return <LoadingSpinner text="Checking availability..." />;

  if (pageState === "not-found" || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Not found</CardTitle>
            <CardDescription>This booking link is invalid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!profile.isAvailableForBooking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{profile.firstName} {profile.lastName}</CardTitle>
            <CardDescription>Not currently accepting new bookings.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg space-y-6">
        <PhotographerHeader profile={profile} />

        {step === "availability" && (
          <AvailabilityForm
            formik={availabilityFormik}
            photographerFirstName={profile.firstName}
            availabilityError={availabilityError}
            today={today}
          />
        )}

        {step === "details" && availabilityChecked && (
          <CustomerDetailsForm
            formik={detailsFormik}
            availabilityChecked={availabilityChecked}
            onBack={() => { setStep("availability"); setAvailabilityError(""); }}
          />
        )}

        {step === "confirmed" && (
          <BookingConfirmed
            photographerFirstName={profile.firstName}
            trackingToken={trackingToken}
            origin={origin}
          />
        )}
      </div>
    </main>
  );
}
