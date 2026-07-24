"use client";

import React, { useState } from "react";
import { useTracking } from "./hooks/useTracking";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ChatBox } from "@/components/common/ChatBox";
import { EmailVerificationScreen } from "@/components/tracking/EmailVerificationScreen";
import { ReservationHeader } from "@/components/tracking/ReservationHeader";
import { BookingSummaryCard } from "@/components/tracking/BookingSummaryCard";
import { RejectionNotice } from "@/components/tracking/RejectionNotice";
import { CancelledNotice } from "@/components/tracking/CancelledNotice";
import { ProposalSection } from "@/components/tracking/ProposalSection";
import { calculateDepositAmount } from "@/components/tracking/hooks/useProposalSection";
import { PaymentSandboxModal } from "@/components/modals/PaymentSandboxModal";

import { TrackingErrorState } from "./components/TrackingErrorState";
import { RemainingBalanceCard } from "./components/RemainingBalanceCard";
import { FullyPaidCard } from "./components/FullyPaidCard";
import {
  PaymentConfirmDialog,
  type PaymentConfirmDetails,
} from "./components/PaymentConfirmDialog";

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
    selectedPkgId,
    setSelectedPkgId,
    confirming,
    cancelling,
    handleVerifyEmail,
    handleSendMessage,
    handleCancelReservation,
    getDeadlineText,
    refetchReservation,
  } = useTracking();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentConfirmDetails, setPaymentConfirmDetails] =
    useState<PaymentConfirmDetails | null>(null);


  if (loading && !verifiedEmail) {
    return <LoadingSpinner text="Checking verification..." />;
  }

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

  if (loading) {
    return <LoadingSpinner text="Loading reservation details..." />;
  }

  if (error || !reservation) {
    return (
      <TrackingErrorState
        error={error}
        token={token}
        onResetEmail={() => setVerifiedEmail(null)}
      />
    );
  }

  const isExpired =
    reservation.status === "PROPOSED" &&
    reservation.paymentDeadline &&
    new Date(reservation.paymentDeadline) < new Date();

  const chatDisabled =
    reservation.status === "CANCELLED" || reservation.status === "REJECTED";

  const handlePayRemainingBalance = (remainingBalanceCents: number) => {
    if (reservation.clientSelectedPackageId) {
      setPaymentConfirmDetails({
        title: "Confirm Balance Payment?",
        description: `You are about to proceed to checkout to pay the remaining balance of LKR ${(
          remainingBalanceCents / 100
        ).toLocaleString()} using a simulated card payment.`,
        action: () => {
          setSelectedPkgId(reservation.clientSelectedPackageId!);
          setShowPaymentModal(true);
        },
      });
      setShowPaymentConfirm(true);
    }
  };

  const handleConfirmDeposit = () => {
    const depositAmt = calculateDepositAmount(reservation, selectedPkgId);
    setPaymentConfirmDetails({
      title: "Confirm Deposit Payment?",
      description: `You are about to proceed to checkout to pay the advance deposit of LKR ${(
        depositAmt / 100
      ).toLocaleString()} to lock in this reservation request.`,
      action: () => {
        setShowPaymentModal(true);
      },
    });
    setShowPaymentConfirm(true);
  };

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 md:px-8 dark:bg-zinc-950 animate-in fade-in duration-300">
      <div className="mx-auto max-w-5xl space-y-6">
        <ReservationHeader reservation={reservation} />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main info column */}
          <div className="md:col-span-2 space-y-6">
            <BookingSummaryCard reservation={reservation} />

            <RemainingBalanceCard
              reservation={reservation}
              onPayBalance={handlePayRemainingBalance}
            />

            <FullyPaidCard reservation={reservation} token={token} />

            {reservation.status === "REJECTED" && (
              <RejectionNotice reason={reservation.rejectionReason} />
            )}

            {(reservation.status === "CANCELLED" || isExpired) && (
              <CancelledNotice />
            )}

            <ProposalSection
              reservation={reservation}
              selectedPkgId={selectedPkgId}
              confirming={confirming}
              onSelectPackage={setSelectedPkgId}
              onConfirm={handleConfirmDeposit}
              getDeadlineText={getDeadlineText}
              onCancel={handleCancelReservation}
              cancelling={cancelling}
            />
          </div>


          <div className="md:sticky md:top-6 md:self-start">
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
              photographerFirstName={reservation.photographer.firstName}
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
          onSuccess={() => {
            refetchReservation();
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      <PaymentConfirmDialog
        open={showPaymentConfirm}
        onOpenChange={setShowPaymentConfirm}
        details={paymentConfirmDetails}
      />
    </main>
  );
}
