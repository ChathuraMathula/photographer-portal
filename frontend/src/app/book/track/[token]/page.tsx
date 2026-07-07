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
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentSandboxModal } from "@/components/modals/PaymentSandboxModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

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
    cancelling,
    handleVerifyEmail,
    handleSendMessage,
    handleConfirmReservation,
    handleCancelReservation,
    getDeadlineText,
    setReservation,
    refetchReservation,
  } = useTracking();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentConfirmDetails, setPaymentConfirmDetails] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

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

  const isExpired =
    reservation.status === "PROPOSED" &&
    reservation.paymentDeadline &&
    new Date(reservation.paymentDeadline) < new Date();

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

            {reservation.status === "CONFIRMED" && (reservation.totalAmountInCents ?? 0) > (reservation.totalPaidInCents ?? 0) && (
              <Card className="border border-zinc-200/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Complete Remaining Balance</CardTitle>
                  <CardDescription className="text-xs">
                    Your deposit was paid successfully. Please settle the remaining balance of <strong>LKR {(((reservation.totalAmountInCents ?? 0) - (reservation.totalPaidInCents ?? 0)) / 100).toLocaleString()}</strong>.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold" 
                    onClick={() => {
                      if (reservation.clientSelectedPackageId) {
                        setPaymentConfirmDetails({
                          title: "Confirm Balance Payment?",
                          description: `You are about to proceed to checkout to pay the remaining balance of LKR ${(((reservation.totalAmountInCents ?? 0) - (reservation.totalPaidInCents ?? 0)) / 100).toLocaleString()} using a simulated card payment.`,
                          action: () => {
                            setSelectedPkgId(reservation.clientSelectedPackageId!);
                            setShowPaymentModal(true);
                          }
                        });
                        setShowPaymentConfirm(true);
                      }
                    }}
                  >
                    Pay Remaining Balance (LKR {(((reservation.totalAmountInCents ?? 0) - (reservation.totalPaidInCents ?? 0)) / 100).toLocaleString()})
                  </Button>
                </CardFooter>
              </Card>
            )}

            {reservation.status === "CONFIRMED" && (reservation.totalPaidInCents ?? 0) >= (reservation.totalAmountInCents ?? 1) && (
              <Card className="border border-green-200/50 shadow-sm rounded-xl overflow-hidden bg-green-50/10 dark:bg-green-950/10">
                <CardHeader>
                  <CardTitle className="text-body-base-bold font-bold text-green-700 dark:text-green-400">Booking Fully Paid</CardTitle>
                  <CardDescription className="text-xs">
                    All payments for this reservation are completed. You can download your official system-generated invoice below.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <a 
                    href={`${API}/invoices/public/${token}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-body-caption font-bold shadow-md cursor-pointer transition-all"
                  >
                    Download PDF Invoice
                  </a>
                </CardFooter>
              </Card>
            )}

            {reservation.status === "REJECTED" && (
              <RejectionNotice reason={reservation.rejectionReason} />
            )}
            {(reservation.status === "CANCELLED" || isExpired) && <CancelledNotice />}
            <ProposalSection
              reservation={reservation}
              selectedPkgId={selectedPkgId}
              confirming={confirming}
              onSelectPackage={setSelectedPkgId}
              onConfirm={() => {
                const depositAmt = () => {
                  if (!selectedPkgId || !reservation.selectedPackages) return 0;
                  const pkg = reservation.selectedPackages.find((p) => p.id === selectedPkgId);
                  if (!pkg) return 0;
                  if (pkg.customDepositAmountInCents !== undefined && pkg.customDepositAmountInCents !== null) {
                    return pkg.customDepositAmountInCents;
                  }
                  if (pkg.depositType === "fixed") {
                    return pkg.depositValue ?? 0;
                  }
                  if (pkg.depositType === "percentage") {
                    return Math.round((pkg.priceInCents * (pkg.depositValue ?? 0)) / 100);
                  }
                  return 0;
                };
                setPaymentConfirmDetails({
                  title: "Confirm Deposit Payment?",
                  description: `You are about to proceed to checkout to pay the advance deposit of LKR ${(depositAmt() / 100).toLocaleString()} to lock in this reservation request.`,
                  action: () => {
                    setShowPaymentModal(true);
                  }
                });
                setShowPaymentConfirm(true);
              }}
              getDeadlineText={getDeadlineText}
              onCancel={handleCancelReservation}
              cancelling={cancelling}
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
          onSuccess={(updatedStatus, pkgId) => {
            refetchReservation();
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Nice shadcn Alert Dialog for Payment Confirmation */}
      {showPaymentConfirm && paymentConfirmDetails && (
        <AlertDialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
          <AlertDialogContent className="max-w-sm rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold">
                {paymentConfirmDetails.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-550 dark:text-zinc-400 text-xs">
                {paymentConfirmDetails.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row sm:justify-end gap-2 pt-2">
              <AlertDialogCancel className="rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs h-10 w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowPaymentConfirm(false);
                  paymentConfirmDetails.action();
                }}
                className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-100 font-semibold text-xs rounded-xl h-10 w-full sm:w-auto"
              >
                Proceed to Pay
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  );
}
