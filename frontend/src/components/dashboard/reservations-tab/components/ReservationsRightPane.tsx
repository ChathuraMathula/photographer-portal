"use client";

import React from "react";
import { type Reservation, type Package } from "@/types";
import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";
import { CustomerDetailsCard } from "../../CustomerDetailsCard";
import { ProposalStatusCard } from "../../ProposalStatusCard";
import { ReservationsProposalSection } from "./ReservationsProposalSection";

interface ReservationsRightPaneProps {
  selectedRes: Reservation | null;
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

export function ReservationsRightPane(props: ReservationsRightPaneProps) {
  if (!props.selectedRes) {
    return (
      <div className="lg:col-span-2 space-y-4">
        <div className="h-[400px] flex items-center justify-center border border-dashed rounded-xl text-zinc-400 text-body-small-s">
          Select a reservation from the list to view details, proposal forms, and client chat thread.
        </div>
      </div>
    );
  }

  const showProposeCard =
    props.selectedRes.status === "PENDING" || props.selectedRes.status === "PROPOSED";
  const showStatusCard =
    props.selectedRes.status === "PROPOSED" || props.selectedRes.status === "CONFIRMED";

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <CustomerDetailsCard reservation={props.selectedRes} />

        {showProposeCard && (
          <ReservationsProposalSection
            {...props}
            selectedRes={props.selectedRes}
          />
        )}

        {showStatusCard && <ProposalStatusCard reservation={props.selectedRes} />}
      </div>
    </div>
  );
}
