"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { ReservationsLeftPane } from "@/components/dashboard/reservations-tab/components/ReservationsLeftPane";

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const {
    reservations,
    selectedRes,
    setSelectedRes,
    setShowRejectForm,
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

  // Handle legacy query params redirects (e.g. ?id=... -> /dashboard/reservations/[id])
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      router.replace(`/dashboard/reservations/${id}`);
    }
  }, [searchParams, router]);

  // Sync page number from query params if specified
  useEffect(() => {
    const urlPage = searchParams.get("page");
    if (urlPage) {
      const parsedPage = parseInt(urlPage, 10);
      if (!isNaN(parsedPage) && parsedPage > 0 && parsedPage !== page) {
        setPage(parsedPage);
      }
    }
  }, [searchParams, page, setPage]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative">
        <div>
          <h2 className="text-title-large text-primary-dark dark:text-white">
            Welcome back, {firstName}
          </h2>
          <p className="text-body-small text-zinc-500 mt-1">
            Manage and review all your incoming booking requests and reservations.
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs">
        <ReservationsLeftPane
          reservations={reservations}
          selectedRes={selectedRes}
          setSelectedRes={setSelectedRes}
          setShowRejectForm={setShowRejectForm}
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
    </div>
  );
}
