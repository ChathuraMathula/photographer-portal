"use client";

import React, { useState } from "react";
import { useTracking } from "./hooks/useTracking";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ChatBox } from "@/components/common/ChatBox";
import { EmailVerificationScreen } from "@/components/tracking/EmailVerificationScreen";
import { ReservationHeader } from "@/components/tracking/ReservationHeader";
import { BookingSummaryCard } from "@/components/tracking/BookingSummaryCard";
import { RejectionNotice } from "@/components/tracking/RejectionNotice";
import { CancelledNotice } from "@/components/tracking/CancelledNotice";
import { ProposalSection } from "@/components/tracking/ProposalSection";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentSandboxModal } from "@/components/tracking/PaymentSandboxModal";

export default function TrackingPage() {
  const {
    token,
    verifiedEmail,
    setVerifiedEmail,
    emailInput,
    setEmailInput,
    verifying,
    verificationError,
    reservation,
    loading,
    error,
    messages,
    messageText,
    setMessageText,
    chatEndRef,
    selectedPkgId,
    setSelectedPkgId,
    confirming,
    handleVerifyEmail,
    handleSendMessage,
    handleConfirmReservation,
    getDeadlineText,
    setReservation,
  } = useTracking();

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── Render gates ──────────────────────────────────────────────────────────

  if (loading && !verifiedEmail) return <LoadingSpinner text="Checking verification..." />;

  if (!verifiedEmail) {
    return (
      <EmailVerificationScreen
        emailInput={emailInput}
        verifying={verifying}
        verificationError={verificationError}
        onEmailChange={setEmailInput}
        onSubmit={handleVerifyEmail}
      />
    );
  }

  if (loading) return <LoadingSpinner text="Loading reservation details..." />;

  if (error || !reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error || "Reservation not found"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                localStorage.removeItem(`verified_email_res_${token}`);
                setVerifiedEmail(null);
              }}
            >
              Try Different Email
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const chatDisabled =
    reservation.status === "CANCELLED" || reservation.status === "REJECTED";

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 md:px-8 dark:bg-zinc-950 animate-in fade-in duration-300">
      <div className="mx-auto max-w-5xl space-y-6">
        <ReservationHeader reservation={reservation} />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main info column */}
          <div className="md:col-span-2 space-y-6">
            <BookingSummaryCard reservation={reservation} />
            {reservation.status === "REJECTED" && (
              <RejectionNotice reason={reservation.rejectionReason} />
            )}
            {reservation.status === "CANCELLED" && <CancelledNotice />}
            <ProposalSection
              reservation={reservation}
              selectedPkgId={selectedPkgId}
              confirming={confirming}
              onSelectPackage={setSelectedPkgId}
              onConfirm={() => setShowPaymentModal(true)}
              getDeadlineText={getDeadlineText}
            />
          </div>

          {/* Chat column */}
          <div>
            <ChatBox
              messages={messages}
              messageText={messageText}
              onMessageChange={setMessageText}
              onSend={handleSendMessage}
              disabled={chatDisabled}
              myRole="CUSTOMER"
              title="Negotiation Chat"
              description="Have questions about custom pricing or timing? Chat here."
              reservationId={reservation.id}
            />
          </div>
        </div>
      </div>

      {showPaymentModal && selectedPkgId && (
        <PaymentSandboxModal
          open={showPaymentModal}
          reservation={reservation}
          token={token}
          packageId={selectedPkgId}
          onSuccess={(updatedStatus, pkgId) => {
            setReservation((prev) =>
              prev ? { ...prev, status: updatedStatus as any, clientSelectedPackageId: pkgId } : null
            );
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </main>
  );
}
