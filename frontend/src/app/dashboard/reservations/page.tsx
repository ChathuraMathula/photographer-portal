"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { ReservationsTabContent } from "@/components/dashboard/reservations-tab/ReservationsTabContent";

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    reservationsLoading,
    firstName,
  } = context;

  useEffect(() => {
    const id = searchParams.get("id");
    const fromCalendar = searchParams.get("fromCalendar");
    const fromNotification = searchParams.get("fromNotification");
    const urlPage = searchParams.get("page");

    if (urlPage) {
      const parsedPage = parseInt(urlPage, 10);
      if (!isNaN(parsedPage) && parsedPage !== page) {
        setPage(parsedPage);
      }
    }

    if (id && (fromCalendar === "true" || fromNotification === "true")) {
      setSearch(id);
      setStatusFilter("ALL");
      setSortBy("date");
      setSortOrder("DESC");
      
      // Remove flags from the URL so it doesn't trigger again on reload
      router.replace(`/dashboard/reservations?id=${id}`, { scroll: false });
    }
  }, [searchParams, router, setSearch, setStatusFilter, setSortBy, setSortOrder, page, setPage]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative">
        <div>
          <h2 className="text-title-large text-primary-dark dark:text-white">
            Welcome back, {firstName}
          </h2>
          <p className="text-body-small text-zinc-500 mt-1">
            Manage your reservations, packages and profile below.
          </p>
        </div>
      </header>

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
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        reservationsLoading={reservationsLoading}
      />
    </div>
  );
}
