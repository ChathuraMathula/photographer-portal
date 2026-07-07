"use client";

import { toast } from "sonner";
import { type TrackingReservation } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useTrackingActions(
  token: string,
  verifiedEmail: string | null,
  setVerifiedEmail: React.Dispatch<React.SetStateAction<string | null>>,
  setVerificationError: React.Dispatch<React.SetStateAction<string>>,
  setVerifying: React.Dispatch<React.SetStateAction<boolean>>,
  setReservation: React.Dispatch<
    React.SetStateAction<TrackingReservation | null>
  >,
  setConfirming: React.Dispatch<React.SetStateAction<boolean>>,
  setCancelling: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const handleVerifyEmail = async (emailInput: string) => {
    setVerifying(true);
    setVerificationError("");
    try {
      const res = await fetch(`${API}/bookings/track/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email verification failed");
      localStorage.setItem(`verified_email_res_${token}`, emailInput);
      setVerifiedEmail(emailInput);
    } catch (err: any) {
      setVerificationError(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !verifiedEmail || !token) return;
    try {
      await fetch(`${API}/bookings/track/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedEmail, content: text }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReservation = async (selectedPkgId: string | null) => {
    if (!selectedPkgId || !verifiedEmail || !token) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API}/bookings/track/${token}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifiedEmail,
          packageId: selectedPkgId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Confirmation failed");
      setReservation((prev) =>
        prev
          ? {
              ...prev,
              status: "CONFIRMED",
              clientSelectedPackageId: selectedPkgId,
            }
          : null,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm reservation");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!verifiedEmail || !token) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API}/bookings/track/${token}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");
      setReservation((prev) =>
        prev ? { ...prev, status: "CANCELLED" } : null,
      );
      toast.success("Reservation cancelled successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel reservation");
    } finally {
      setCancelling(false);
    }
  };

  return {
    handleVerifyEmail,
    handleSendMessage,
    handleConfirmReservation,
    handleCancelReservation,
  };
}
