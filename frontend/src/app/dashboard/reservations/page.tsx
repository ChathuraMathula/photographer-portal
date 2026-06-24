"use client";

import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { ReservationsTabContent } from "@/components/dashboard/ReservationsTabContent";

export default function ReservationsPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const {
    reservations,
    packages,
    selectedRes,
    setSelectedRes,
    selectedPkgIds,
    setSelectedPkgIds,
    advanceAmount,
    setAdvanceAmount,
    quotationNotes,
    setQuotationNotes,
    rejectionReason,
    setRejectionReason,
    showRejectForm,
    setShowRejectForm,
    handleProposeQuotation,
    handleRejectRequest,
  } = context;

  return (
    <ReservationsTabContent
      reservations={reservations}
      packages={packages}
      selectedRes={selectedRes}
      setSelectedRes={setSelectedRes}
      selectedPkgIds={selectedPkgIds}
      setSelectedPkgIds={setSelectedPkgIds}
      advanceAmount={advanceAmount}
      setAdvanceAmount={setAdvanceAmount}
      quotationNotes={quotationNotes}
      setQuotationNotes={setQuotationNotes}
      rejectionReason={rejectionReason}
      setRejectionReason={setRejectionReason}
      showRejectForm={showRejectForm}
      setShowRejectForm={setShowRejectForm}
      handleProposeQuotation={handleProposeQuotation}
      handleRejectRequest={handleRejectRequest}
    />
  );
}
