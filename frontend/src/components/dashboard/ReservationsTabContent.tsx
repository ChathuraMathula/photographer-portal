"use client";
import React from "react";
import { ReservationsLeftPane } from "./reservations-tab/components/ReservationsLeftPane";
import { ReservationsRightPane } from "./reservations-tab/components/ReservationsRightPane";
import { type ReservationsTabContentProps } from "./reservations-tab/types";

export function ReservationsTabContent(props: ReservationsTabContentProps) {
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
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
        sortBy={props.sortBy}
        setSortBy={props.setSortBy}
        sortOrder={props.sortOrder}
        setSortOrder={props.setSortOrder}
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
