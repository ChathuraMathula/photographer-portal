"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API = "http://localhost:3000";

type PhotographerProfile = {
  bookingSlug: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specializations: string[];
  baseLocation?: string;
  isAvailableForBooking: boolean;
};

// ── Validation schemas ───────────────────────────────────────────────────────

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

// ── Helper ───────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500">{msg}</p>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Step = "availability" | "details" | "confirmed";
type AvailabilityValues = { date: string; startTime: string; endTime: string; eventType: string };

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

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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

  // ── Step 1: availability check ───────────────────────────────────────────

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
        setAvailabilityError(
          data.reason ?? "This time slot is not available. Please try another.",
        );
      }
    },
  });

  // ── Step 2: customer details ─────────────────────────────────────────────

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

  // ── Render states ────────────────────────────────────────────────────────

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </main>
    );
  }

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

        {/* Photographer header card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {profile.firstName} {profile.lastName}
            </CardTitle>
            {profile.bio && <CardDescription>{profile.bio}</CardDescription>}
            {profile.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.specializations.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {profile.baseLocation && (
              <p className="pt-1 text-sm text-zinc-500">{profile.baseLocation}</p>
            )}
          </CardHeader>
        </Card>

        {/* ── Step 1: Check availability ── */}
        {step === "availability" && (
          <Card>
            <CardHeader>
              <CardTitle>Check Availability</CardTitle>
              <CardDescription>
                Pick your preferred date and time to see if {profile.firstName} is free.
              </CardDescription>
            </CardHeader>

            <form onSubmit={availabilityFormik.handleSubmit}>
              <CardContent className="space-y-4">
                {availabilityError && (
                  <div className="rounded-md bg-red-100 p-3 text-sm text-red-600 dark:bg-red-900/30">
                    {availabilityError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    {...availabilityFormik.getFieldProps("date")}
                    className={availabilityFormik.touched.date && availabilityFormik.errors.date ? "border-red-500" : ""}
                  />
                  <FieldError msg={availabilityFormik.touched.date ? availabilityFormik.errors.date : undefined} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...availabilityFormik.getFieldProps("startTime")}
                      className={availabilityFormik.touched.startTime && availabilityFormik.errors.startTime ? "border-red-500" : ""}
                    />
                    <FieldError msg={availabilityFormik.touched.startTime ? availabilityFormik.errors.startTime : undefined} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...availabilityFormik.getFieldProps("endTime")}
                      className={availabilityFormik.touched.endTime && availabilityFormik.errors.endTime ? "border-red-500" : ""}
                    />
                    <FieldError msg={availabilityFormik.touched.endTime ? availabilityFormik.errors.endTime : undefined} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Input
                    id="eventType"
                    placeholder="e.g. Wedding, Portrait, Corporate Event"
                    {...availabilityFormik.getFieldProps("eventType")}
                    className={availabilityFormik.touched.eventType && availabilityFormik.errors.eventType ? "border-red-500" : ""}
                  />
                  <FieldError msg={availabilityFormik.touched.eventType ? availabilityFormik.errors.eventType : undefined} />
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full" disabled={availabilityFormik.isSubmitting}>
                  {availabilityFormik.isSubmitting ? "Checking..." : "Check Availability"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 2: Customer details ── */}
        {step === "details" && availabilityChecked && (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <CardDescription>
                {availabilityChecked.date} · {availabilityChecked.startTime}–{availabilityChecked.endTime} · {availabilityChecked.eventType}
                <span className="ml-2 font-medium text-emerald-600">Available</span>
              </CardDescription>
            </CardHeader>

            <form onSubmit={detailsFormik.handleSubmit}>
              <CardContent className="space-y-4">
                {detailsFormik.status && (
                  <div className="rounded-md bg-red-100 p-3 text-sm text-red-600 dark:bg-red-900/30">
                    {detailsFormik.status}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...detailsFormik.getFieldProps("firstName")}
                      className={detailsFormik.touched.firstName && detailsFormik.errors.firstName ? "border-red-500" : ""}
                    />
                    <FieldError msg={detailsFormik.touched.firstName ? detailsFormik.errors.firstName : undefined} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...detailsFormik.getFieldProps("lastName")}
                      className={detailsFormik.touched.lastName && detailsFormik.errors.lastName ? "border-red-500" : ""}
                    />
                    <FieldError msg={detailsFormik.touched.lastName ? detailsFormik.errors.lastName : undefined} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...detailsFormik.getFieldProps("email")}
                    className={detailsFormik.touched.email && detailsFormik.errors.email ? "border-red-500" : ""}
                  />
                  <FieldError msg={detailsFormik.touched.email ? detailsFormik.errors.email : undefined} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...detailsFormik.getFieldProps("phone")}
                    className={detailsFormik.touched.phone && detailsFormik.errors.phone ? "border-red-500" : ""}
                  />
                  <FieldError msg={detailsFormik.touched.phone ? detailsFormik.errors.phone : undefined} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Venue / Location{" "}
                    <span className="text-zinc-400">(optional)</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Cinnamon Grand, Colombo"
                    {...detailsFormik.getFieldProps("location")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Notes{" "}
                    <span className="text-zinc-400">(optional)</span>
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Any special requirements..."
                    {...detailsFormik.getFieldProps("notes")}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("availability");
                    setAvailabilityError("");
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={detailsFormik.isSubmitting}
                >
                  {detailsFormik.isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 3: Confirmed ── */}
        {step === "confirmed" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-600">Request Submitted!</CardTitle>
              <CardDescription>
                Your request has been sent to {profile.firstName}. They will
                contact you to confirm the details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Save this link to track your reservation status:
              </p>
              <code className="block break-all rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
                {origin}/book/track/{trackingToken}
              </code>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
