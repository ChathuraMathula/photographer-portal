"use client";

import React from "react";
import { type Reservation, type Package } from "@/types";
import { type CustomPackageValues } from "./CustomPackageModal";
import { ReservationsLeftPane } from "./reservations-tab/components/ReservationsLeftPane";
import { ReservationsRightPane } from "./reservations-tab/components/ReservationsRightPane";

type Props = {
  reservations: Reservation[];
  packages: Package[];
  selectedRes: Reservation | null;
  setSelectedRes: (res: Reservation | null) => void;
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
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  total: number;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  reservationsLoading: boolean;
};

export function ReservationsTabContent(props: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ReservationsLeftPane
        reservations={props.reservations}
        selectedRes={props.selectedRes}
        setSelectedRes={props.setSelectedRes}
        setShowRejectForm={props.setShowRejectForm}
        page={props.page}
        setPage={props.setPage}
        totalPages={props.totalPages}
        total={props.total}
        search={props.search}
        setSearch={props.setSearch}
        statusFilter={props.statusFilter}
        setStatusFilter={props.setStatusFilter}
        reservationsLoading={props.reservationsLoading}
      />

      <ReservationsRightPane
        selectedRes={props.selectedRes}
        packages={props.packages}
        selectedPkgIds={props.selectedPkgIds}
        setSelectedPkgIds={props.setSelectedPkgIds}
        quotationNotes={props.quotationNotes}
        setQuotationNotes={props.setQuotationNotes}
        rejectionReason={props.rejectionReason}
        setRejectionReason={props.setRejectionReason}
        showRejectForm={props.showRejectForm}
        setShowRejectForm={props.setShowRejectForm}
        handleProposeQuotation={props.handleProposeQuotation}
        handleRejectRequest={props.handleRejectRequest}
        packageDeposits={props.packageDeposits}
        setPackageDeposits={props.setPackageDeposits}
        customPackage={props.customPackage}
        setCustomPackage={props.setCustomPackage}
        customPackageDeposit={props.customPackageDeposit}
        setCustomPackageDeposit={props.setCustomPackageDeposit}
        isCustomPackageSelected={props.isCustomPackageSelected}
        setIsCustomPackageSelected={props.setIsCustomPackageSelected}
      />
    </div>
  );
}
