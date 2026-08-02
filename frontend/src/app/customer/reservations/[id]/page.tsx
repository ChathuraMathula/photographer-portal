"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Link from "next/link";
import { type TrackingReservation, type ChatMessage } from "@/types";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { ChatBox } from "@/components/common/ChatBox";
import { ReservationHeader } from "@/components/tracking/ReservationHeader";
import { BookingSummaryCard } from "@/components/tracking/BookingSummaryCard";
import { RejectionNotice } from "@/components/tracking/RejectionNotice";
import { CancelledNotice } from "@/components/tracking/CancelledNotice";
import { ProposalSection } from "@/components/tracking/ProposalSection";
import { calculateDepositAmount } from "@/components/tracking/hooks/useProposalSection";
import { PaymentSandboxModal } from "@/components/modals/PaymentSandboxModal";
import { RemainingBalanceCard } from "@/app/book/track/[token]/components/RemainingBalanceCard";
import { FullyPaidCard } from "@/app/book/track/[token]/components/FullyPaidCard";
import {
  PaymentConfirmDialog,
  type PaymentConfirmDetails,
} from "@/app/book/track/[token]/components/PaymentConfirmDialog";
import { getDeadlineText } from "@/app/book/track/[token]/utils/dateUtils";
import { useTrackingSocket } from "@/app/book/track/[token]/hooks/useTrackingSocket";
import { useTrackingActions } from "@/app/book/track/[token]/hooks/useTrackingActions";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const reservationId = params?.id as string;

  const [reservation, setReservation] = useState<TrackingReservation | null>(null);
  const [token, setToken] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [mobileTab, setMobileTab] = useState<"details" | "chat">("details");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [paymentConfirmDetails, setPaymentConfirmDetails] = useState<PaymentConfirmDetails | null>(null);

  const socketRef = useRef<any>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

  // Step 1: Resolve reservationToken and customer details
  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadReservation = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/customer/reservations`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load customer reservations");
        const list = await res.json();
        const target = list.find((r: any) => r.id === reservationId);

        if (target && target.reservationToken) {
          setToken(target.reservationToken);
          const email = auth.email || target.customer?.email || "";
          setCustomerEmail(email);

          // Fetch full tracking details
          const trackRes = await fetch(
            `${API}/bookings/track/${target.reservationToken}?email=${encodeURIComponent(email)}`
          );
          if (trackRes.ok) {
            const trackData: TrackingReservation = await trackRes.json();
            setReservation(trackData);
            if (trackData.clientSelectedPackageId) {
              setSelectedPkgId(trackData.clientSelectedPackageId);
            }
          }
        } else {
          setError("Reservation not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [reservationId, auth, router, API]);

  // Connect socket for real-time tracking, chat & updates
  useTrackingSocket(
    reservation,
    customerEmail,
    token,
    setMessages,
    setReservation,
    socketRef,
    () => {}
  );

  const actions = useTrackingActions(
    token,
    customerEmail,
    () => {},
    () => {},
    () => {},
    setReservation,
    setConfirming,
    setCancelling
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !reservation) return;
    const textToSend = messageText;
    setMessageText("");

    fetch(`${API}/bookings/track/${token}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customerEmail, content: textToSend }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((newMsg) => {
        if (newMsg) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .catch(console.error);
  };

  const refetchReservation = () => {
    if (!token || !customerEmail) return;
    fetch(`${API}/bookings/track/${token}?email=${encodeURIComponent(customerEmail)}`)
      .then((r) => r.json())
      .then((data) => setReservation(data))
      .catch(console.error);
  };

  const handlePayRemainingBalance = (remainingBalanceCents: number) => {
    if (reservation?.clientSelectedPackageId) {
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
    if (!reservation || !selectedPkgId) return;
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

  const isExpired =
    reservation?.status === "PROPOSED" &&
    reservation?.paymentDeadline &&
    new Date(reservation.paymentDeadline) < new Date();

  const chatDisabled =
    reservation?.status === "CANCELLED" || reservation?.status === "REJECTED";

  if (loading) {
    return <LoadingSpinner text="Loading session details..." />;
  }

  if (error || !reservation) {
    return (
      <div className="p-8 text-center text-xs text-red-600 bg-red-50 rounded-xl font-medium">
        {error || "Reservation not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Navigation Topbar Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/customer/dashboard">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-bold gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-none">
              {reservation.eventType} Session
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Ref #{reservation.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Mobile View Toggle Switcher */}
        <div className="flex lg:hidden grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-xs w-full">
          <button
            type="button"
            onClick={() => setMobileTab("details")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === "details"
                ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Details & Proposal
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("chat")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === "chat"
                ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Live Chat ({messages.length})
          </button>
        </div>
      </header>

      {/* Main Reservation Progress Tracker Bar */}
      <ReservationHeader reservation={reservation} />

      {/* Desktop Layout: Side-by-Side Grid */}
      <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
        {/* Main 7-col info & proposal column */}
        <div className="col-span-7 space-y-6">
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
            onCancel={actions.handleCancelReservation}
            cancelling={cancelling}
          />
        </div>

        {/* Right 5-col sticky negotiation chat box */}
        <div className="col-span-5 sticky top-20">
          <ChatBox
            messages={messages}
            messageText={messageText}
            onMessageChange={setMessageText}
            onSend={handleSendMessage}
            disabled={chatDisabled}
            myRole="CUSTOMER"
            title="Negotiation Chat"
            description="Have questions about timing or custom proposals? Chat live here."
            reservationId={reservation.id}
            photographerFirstName={reservation.photographer?.firstName}
          />
        </div>
      </div>

      {/* Mobile Layout: Responsive Tab Switcher */}
      <div className="block lg:hidden">
        {mobileTab === "details" ? (
          <div className="space-y-6">
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
              onCancel={actions.handleCancelReservation}
              cancelling={cancelling}
            />
          </div>
        ) : (
          <div className="w-full">
            <ChatBox
              messages={messages}
              messageText={messageText}
              onMessageChange={setMessageText}
              onSend={handleSendMessage}
              disabled={chatDisabled}
              myRole="CUSTOMER"
              title="Negotiation Chat"
              description="Have questions about timing or custom proposals? Chat live here."
              reservationId={reservation.id}
              photographerFirstName={reservation.photographer?.firstName}
            />
          </div>
        )}
      </div>

      {/* Simulated Payment Sandbox Modal & Confirmation Dialog */}
      {showPaymentModal && selectedPkgId && (
        <PaymentSandboxModal
          open={showPaymentModal}
          reservation={reservation}
          token={token}
          packageId={selectedPkgId}
          onSuccess={() => refetchReservation()}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      <PaymentConfirmDialog
        open={showPaymentConfirm}
        onOpenChange={setShowPaymentConfirm}
        details={paymentConfirmDetails}
      />
    </div>
  );
}
