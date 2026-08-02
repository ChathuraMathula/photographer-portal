"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePhotographerDashboardContext } from "../../context/PhotographerDashboardContext";
import { ReservationsRightPane } from "@/components/dashboard/reservations-tab/components/ReservationsRightPane";
import { ChatBox } from "@/components/common/ChatBox";
import { FileText, MessageSquare, Calendar, User } from "lucide-react";
import { type Reservation } from "@/types";

export default function ReservationDetailPage() {
  const params = useParams();
  const context = usePhotographerDashboardContext();
  const [mobileTab, setMobileTab] = useState<"details" | "chat">("details");
  const [fetchedRes, setFetchedRes] = useState<Reservation | null>(null);
  const [loadingRes, setLoadingRes] = useState(false);

  const reservationId = params?.id as string;

  if (!context) return null;

  const {
    reservations,
    calendarReservations,
    selectedRes,
    setSelectedRes,
    packages,
    selectedPkgIds,
    setSelectedPkgIds,
    quotationNotes,
    setQuotationNotes,
    rejectionReason,
    setRejectionReason,
    showRejectForm,
    setShowRejectForm,
    handleProposeQuotation,
    handleRejectRequest,
    packageDeposits,
    setPackageDeposits,
    customPackage,
    setCustomPackage,
    customPackageDeposit,
    setCustomPackageDeposit,
    isCustomPackageSelected,
    setIsCustomPackageSelected,
    messages,
    messageText,
    setMessageText,
    handleSendChatMessage,
    chatDisabled,
    authFetch,
  } = context;

  // Resolve target reservation from selectedRes, reservations list, calendarReservations, or API fetch fallback
  useEffect(() => {
    if (!reservationId) return;

    // 1. Check selectedRes
    if (selectedRes?.id === reservationId) {
      setFetchedRes(selectedRes);
      return;
    }

    // 2. Check main reservations list
    const foundInList = reservations.find((r) => r.id === reservationId);
    if (foundInList) {
      setSelectedRes(foundInList);
      setFetchedRes(foundInList);
      return;
    }

    // 3. Check calendar reservations list
    const foundInCalendar = calendarReservations?.find((r) => r.id === reservationId);
    if (foundInCalendar) {
      setSelectedRes(foundInCalendar);
      setFetchedRes(foundInCalendar);
      return;
    }

    // 4. API Fetch Fallback for direct links or calendar items not in state
    let isMounted = true;
    setLoadingRes(true);
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    authFetch(`${API}/reservations/${reservationId}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setSelectedRes(data);
          setFetchedRes(data);
        }
      })
      .catch((err) => console.error("Error fetching single reservation details:", err))
      .finally(() => {
        if (isMounted) setLoadingRes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reservationId, reservations, calendarReservations, selectedRes, setSelectedRes, authFetch]);

  // Mark unread customer messages as read when opening detail page
  useEffect(() => {
    if (reservationId) {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      authFetch(`${API}/reservations/${reservationId}/messages/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch((err) => console.error("Error marking messages as read:", err));
    }
  }, [reservationId, authFetch]);

  const targetRes =
    fetchedRes ||
    (selectedRes?.id === reservationId ? selectedRes : reservations.find((r) => r.id === reservationId) || selectedRes);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300";
      case "PROPOSED":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300";
      case "CANCELLED":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      {targetRes && (
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-none">
                Reservation #{targetRes.id.slice(0, 8)}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(targetRes.status)}`}
              >
                {targetRes.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex flex-wrap items-center gap-2 pt-0.5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                {targetRes.customer?.firstName} {targetRes.customer?.lastName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                {new Date(targetRes.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="uppercase font-bold text-[#0e2d5c] dark:text-blue-400">
                {targetRes.eventType}
              </span>
            </p>
          </div>

          {/* Mobile View Toggle Switcher (Mobile Only) */}
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
              Details & Quote
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
              Live Chat
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      {loadingRes && !targetRes ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-medium">
          Loading reservation details...
        </div>
      ) : !targetRes ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-medium">
          Reservation not found.
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Layout: Side-by-Side Columns */}
          <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Reservation Details & Quotation Section */}
            <div className="col-span-7">
              <ReservationsRightPane
                selectedRes={targetRes}
                packages={packages}
                selectedPkgIds={selectedPkgIds}
                setSelectedPkgIds={setSelectedPkgIds}
                quotationNotes={quotationNotes}
                setQuotationNotes={setQuotationNotes}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
                showRejectForm={showRejectForm}
                setShowRejectForm={setShowRejectForm}
                handleProposeQuotation={handleProposeQuotation}
                handleRejectRequest={handleRejectRequest}
                packageDeposits={packageDeposits}
                setPackageDeposits={setPackageDeposits}
                customPackage={customPackage}
                setCustomPackage={setCustomPackage}
                customPackageDeposit={customPackageDeposit}
                setCustomPackageDeposit={setCustomPackageDeposit}
                isCustomPackageSelected={isCustomPackageSelected}
                setIsCustomPackageSelected={setIsCustomPackageSelected}
              />
            </div>

            {/* Right 5 Columns: Inline Live Chat Box */}
            <div className="col-span-5 sticky top-20">
              <ChatBox
                messages={messages}
                messageText={messageText}
                onMessageChange={setMessageText}
                onSend={handleSendChatMessage}
                disabled={chatDisabled}
                myRole="PHOTOGRAPHER"
                title={`Chat with ${targetRes.customer?.firstName || "Customer"}`}
                description="Live direct messaging with client"
                reservationId={targetRes.id}
                photographerFirstName={targetRes.customer?.firstName}
              />
            </div>
          </div>

          {/* Mobile Layout: Responsive Tab Switcher */}
          <div className="block lg:hidden">
            {mobileTab === "details" ? (
              <ReservationsRightPane
                selectedRes={targetRes}
                packages={packages}
                selectedPkgIds={selectedPkgIds}
                setSelectedPkgIds={setSelectedPkgIds}
                quotationNotes={quotationNotes}
                setQuotationNotes={setQuotationNotes}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
                showRejectForm={showRejectForm}
                setShowRejectForm={setShowRejectForm}
                handleProposeQuotation={handleProposeQuotation}
                handleRejectRequest={handleRejectRequest}
                packageDeposits={packageDeposits}
                setPackageDeposits={setPackageDeposits}
                customPackage={customPackage}
                setCustomPackage={setCustomPackage}
                customPackageDeposit={customPackageDeposit}
                setCustomPackageDeposit={setCustomPackageDeposit}
                isCustomPackageSelected={isCustomPackageSelected}
                setIsCustomPackageSelected={setIsCustomPackageSelected}
              />
            ) : (
              <div className="w-full">
                <ChatBox
                  messages={messages}
                  messageText={messageText}
                  onMessageChange={setMessageText}
                  onSend={handleSendChatMessage}
                  disabled={chatDisabled}
                  myRole="PHOTOGRAPHER"
                  title={`Chat with ${targetRes.customer?.firstName || "Customer"}`}
                  description="Live direct messaging with client"
                  reservationId={targetRes.id}
                  photographerFirstName={targetRes.customer?.firstName}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
