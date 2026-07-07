"use client";

import { useBooking } from "./hooks/useBooking";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { PhotographerHeader } from "@/components/booking/PhotographerHeader";
import { AvailabilityForm } from "@/components/booking/AvailabilityForm";
import { CustomerDetailsForm } from "@/components/booking/CustomerDetailsForm";
import { BookingConfirmed } from "@/components/booking/BookingConfirmed";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  if (pageState === "loading")
    return <LoadingSpinner text="Checking availability..." />;

  if (pageState === "not-found" || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Not found</CardTitle>
            <CardDescription>
              This booking link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950 animate-in fade-in duration-300">
      <div className="mx-auto max-w-lg space-y-6">
        <PhotographerHeader profile={profile} />

        {!profile.isAvailableForBooking ? (
          <Card className="border border-amber-200 bg-amber-50/50 p-6 rounded-xl dark:bg-amber-950/10 dark:border-amber-900/30 shadow-sm animate-in zoom-in-95 duration-200">
            <CardHeader className="p-0">
              <CardTitle className="text-body-base-bold text-amber-900 dark:text-amber-400">
                Bookings Temporarily Closed
              </CardTitle>
              <CardDescription className="text-body-small text-amber-800 dark:text-amber-500 mt-2 font-medium leading-relaxed">
                {profile.offlineMessage ||
                  "I am not currently accepting new booking requests at this time. Please check back later or get in touch through my portfolio."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {step === "availability" && (
              <AvailabilityForm
                formik={availabilityFormik}
                photographerFirstName={profile.firstName}
                availabilityError={availabilityError}
                today={today}
                allowedEventTypes={profile.allowedEventTypes}
                allowCustomEventTypes={profile.allowCustomEventTypes}
              />
            )}

            {step === "details" && availabilityChecked && (
              <CustomerDetailsForm
                formik={detailsFormik}
                availabilityChecked={availabilityChecked}
                onBack={() => {
                  setStep("availability");
                  setAvailabilityError("");
                }}
              />
            )}

            {step === "confirmed" && (
              <BookingConfirmed
                photographerFirstName={profile.firstName}
                trackingToken={trackingToken}
                origin={origin}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
