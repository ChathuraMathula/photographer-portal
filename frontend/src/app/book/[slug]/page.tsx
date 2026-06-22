"use client";

import { useBooking } from "./hooks/useBooking";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PhotographerHeader } from "@/components/booking/PhotographerHeader";
import { AvailabilityForm } from "@/components/booking/AvailabilityForm";
import { CustomerDetailsForm } from "@/components/booking/CustomerDetailsForm";
import { BookingConfirmed } from "@/components/booking/BookingConfirmed";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingPage() {
  const {
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
  } = useBooking();

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
