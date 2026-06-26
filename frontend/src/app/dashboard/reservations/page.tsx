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

  return (
    <ReservationsTabContent
      reservations={reservations}
      packages={packages}
      selectedRes={selectedRes}
      setSelectedRes={setSelectedRes}
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
  );
}
