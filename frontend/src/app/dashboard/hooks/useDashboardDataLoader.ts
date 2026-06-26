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

  const loadTransactions = async () => {
    try {
      const res = await authFetch(`${API}/payments/photographer`, { credentials: "include" });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  };

  const loadPhotographerData = async () => {
    if (role !== UserRole.PHOTOGRAPHER) return;
    if (!userId || userId === "null" || userId === "undefined") return;
    try {
      const [resRes, pkgRes, profRes] = await Promise.all([
        authFetch(`${API}/reservations`, { credentials: "include" }),
        authFetch(`${API}/packages`, { credentials: "include" }),
        authFetch(`${API}/photographers/${userId}`, { credentials: "include" }),
      ]);

      if (resRes.ok) {
        const resData = await resRes.json();
        reservationsState.setReservations(resData);
      }
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
      await loadTransactions();
    } catch (err) {
      console.error("Error loading photographer data:", err);
    }
  };

  return {
    transactions,
    setTransactions,
    loadTransactions,
    loadPhotographerData,
  };
}
