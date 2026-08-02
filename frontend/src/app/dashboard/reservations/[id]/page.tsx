"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePhotographerDashboardContext } from "../../context/PhotographerDashboardContext";
import { ReservationsRightPane } from "@/components/dashboard/reservations-tab/components/ReservationsRightPane";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, MapPin, Clock, FileText } from "lucide-react";

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const context = usePhotographerDashboardContext();

  const reservationId = params?.id as string;

  if (!context) return null;

  const {
    reservations,
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
  } = context;

  useEffect(() => {
    if (reservationId && reservations.length > 0) {
      const found = reservations.find((r) => r.id === reservationId);
      if (found && selectedRes?.id !== found.id) {
        setSelectedRes(found);
      }
    }
  }, [reservationId, reservations, selectedRes, setSelectedRes]);

  const targetRes = selectedRes?.id === reservationId ? selectedRes : reservations.find((r) => r.id === reservationId) || selectedRes;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header with Back Navigation */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/reservations">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-bold gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reservations List
            </Button>
          </Link>
          {targetRes && (
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-none">
                Reservation #{targetRes.id.slice(0, 8)}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {targetRes.customer?.firstName} {targetRes.customer?.lastName} • {targetRes.eventType}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Detail Pane Content */}
      <div className="w-full">
        {targetRes ? (
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
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-medium">
            Loading reservation details...
          </div>
        )}
      </div>
    </div>
  );
}
