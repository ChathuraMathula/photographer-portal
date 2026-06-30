"use client";

import { useState } from "react";
import { UserRole } from "@/store/slices/authSlice";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface Props {
  role: string | null;
  userId: string | null;
  authFetch: any;
  reservationsState: any;
  packagesState: any;
  profile: any;
}

export function useDashboardDataLoader({
  role,
  userId,
  authFetch,
  reservationsState,
  packagesState,
  profile,
}: Props) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionStats, setTransactionStats] = useState({
    totalRevenueInCents: 0,
    cashPaymentsCount: 0,
    cardPaymentsCount: 0,
  });

  const loadTransactions = async (paramsObj?: { page?: number; search?: string; status?: string; method?: string }) => {
    setTransactionsLoading(true);
    try {
      const pageNum = paramsObj?.page || 1;
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "15");
      if (paramsObj?.search) params.append("search", paramsObj.search);
      if (paramsObj?.status && paramsObj.status !== "ALL") params.append("status", paramsObj.status);
      if (paramsObj?.method && paramsObj.method !== "ALL") params.append("method", paramsObj.method);

      const res = await authFetch(`${API}/payments/photographer?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
        setTransactionsPage(data.page || 1);
        setTransactionsTotalPages(data.totalPages || 1);
        setTransactionsTotal(data.total || 0);
        if (data.stats) {
          setTransactionStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadPhotographerData = async () => {
    if (role !== UserRole.PHOTOGRAPHER) return;
    if (!userId || userId === "null" || userId === "undefined") return;
    try {
      const [pkgRes, profRes] = await Promise.all([
        authFetch(`${API}/packages`, { credentials: "include" }),
        authFetch(`${API}/photographers/${userId}`, { credentials: "include" }),
      ]);

      if (pkgRes.ok) {
        packagesState.setPackages(await pkgRes.json());
      }
      if (profRes.ok) {
        const profData = await profRes.json();
        profile.setProfileBio(profData.bio || "");
        profile.setProfileLocation(profData.baseLocation || "");
        profile.setProfilePortfolio(profData.portfolioUrl || "");
        profile.setProfileAvailability(profData.isAvailableForBooking);
        profile.setBookingSlug(profData.bookingSlug || "");
        profile.setProfileImageUrl(profData.profileImageUrl || "");
        profile.setAllowedEventTypes(profData.allowedEventTypes || []);
        profile.setAllowCustomEventTypes(profData.allowCustomEventTypes !== false);
        profile.setUniversalDepositType(profData.universalDepositType || "fixed");
        profile.setUniversalDepositValue(
          profData.universalDepositType === "percentage"
            ? profData.universalDepositValue ?? 10
            : (profData.universalDepositValue ?? 500000) / 100
        );
        profile.setOfflineMessage(profData.offlineMessage || "");
      }
    } catch (err) {
      console.error("Error loading photographer data:", err);
    }
  };

  return {
    transactions,
    setTransactions,
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    setTransactionsTotalPages,
    transactionsTotal,
    setTransactionsTotal,
    transactionStats,
    setTransactionStats,
    transactionsLoading,
    loadTransactions,
    loadPhotographerData,
  };
}
