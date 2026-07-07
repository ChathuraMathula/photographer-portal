"use client";

import React from "react";
import { type Reservation, type Package } from "@/types";
import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";
import { ProposeQuotationCard } from "../../ProposeQuotationCard";

interface ReservationsProposalSectionProps {
  selectedRes: Reservation;
  packages: Package[];
  selectedPkgIds: string[];
  setSelectedPkgIds: React.Dispatch<React.SetStateAction<string[]>>;
  quotationNotes: string;
  setQuotationNotes: (notes: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  showRejectForm: boolean;
  setShowRejectForm: (show: boolean) => void;
  handleProposeQuotation: () => void;
  handleRejectRequest: () => void;
  packageDeposits: Record<string, string>;
  setPackageDeposits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customPackage: CustomPackageValues | null;
  setCustomPackage: (val: CustomPackageValues | null) => void;
  customPackageDeposit: string;
  setCustomPackageDeposit: (val: string) => void;
  isCustomPackageSelected: boolean;
  setIsCustomPackageSelected: (val: boolean) => void;
}

export function ReservationsProposalSection(props: ReservationsProposalSectionProps) {
  const onTogglePackage = (id: string, checked: boolean) => {
    if (checked) {
      props.setSelectedPkgIds((prev) => [...prev, id]);
    } else {
      props.setSelectedPkgIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <ProposeQuotationCard
      packages={props.packages}
      selectedPkgIds={props.selectedPkgIds}
      quotationNotes={props.quotationNotes}
      showRejectForm={props.showRejectForm}
      rejectionReason={props.rejectionReason}
      onTogglePackage={onTogglePackage}
      onNotesChange={props.setQuotationNotes}
      onShowRejectForm={() => props.setShowRejectForm(true)}
      onCancelReject={() => props.setShowRejectForm(false)}
      onRejectionReasonChange={props.setRejectionReason}
      onPropose={props.handleProposeQuotation}
      onReject={props.handleRejectRequest}
      packageDeposits={props.packageDeposits}
      setPackageDeposits={props.setPackageDeposits}
      customPackage={props.customPackage}
      setCustomPackage={props.setCustomPackage}
      customPackageDeposit={props.customPackageDeposit}
      setCustomPackageDeposit={props.setCustomPackageDeposit}
      isCustomPackageSelected={props.isCustomPackageSelected}
      setIsCustomPackageSelected={props.setIsCustomPackageSelected}
      isEdit={props.selectedRes.status === "PROPOSED"}
    />
  );
}
