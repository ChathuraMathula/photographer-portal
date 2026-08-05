"use client";

import { useState } from "react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface UseDashboardProfileProps {
  userId: string | null;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
}

export function useDashboardProfile({
  userId,
  authFetch,
}: UseDashboardProfileProps) {
  const [profileBio, setProfileBio] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [locationMapLink, setLocationMapLink] = useState("");
  const [showMapPreviewOnBookingPage, setShowMapPreviewOnBookingPage] =
    useState(true);
  const [profilePortfolio, setProfilePortfolio] = useState("");
  const [profileAvailability, setProfileAvailability] = useState(true);
  const [bookingSlug, setBookingSlug] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [allowedEventTypes, setAllowedEventTypes] = useState<string[]>([]);
  const [allowCustomEventTypes, setAllowCustomEventTypes] = useState(true);
  const [universalDepositType, setUniversalDepositType] = useState("fixed");
  const [universalDepositValue, setUniversalDepositValue] = useState(5000);
  const [offlineMessage, setOfflineMessage] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [showManualBookingInTopbar, setShowManualBookingInTopbar] =
    useState(true);
  const [showAcceptBookingsInTopbar, setShowAcceptBookingsInTopbar] =
    useState(true);
  const [proposalExpirationHours, setProposalExpirationHours] = useState(24);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const res = await authFetch(`${API}/photographers/${userId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: profileBio,
          specializations,
          baseLocation: profileLocation,
          city,
          district,
          locationMapLink,
          showMapPreviewOnBookingPage,
          portfolioUrl: profilePortfolio,
          profileImageUrl,
          allowedEventTypes,
          allowCustomEventTypes,
          universalDepositType,
          universalDepositValue:
            universalDepositType === "fixed"
              ? Math.round(universalDepositValue * 100)
              : Math.round(universalDepositValue),
          offlineMessage,
          showManualBookingInTopbar,
          showAcceptBookingsInTopbar,
          proposalExpirationHours,
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating profile.");
    }
  };

  const handleToggleAvailability = async () => {
    if (!userId) return;
    try {
      const res = await authFetch(
        `${API}/photographers/${userId}/toggle-availability`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        setProfileAvailability(data.isAvailableForBooking);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    profileBio,
    setProfileBio,
    specializations,
    setSpecializations,
    profileLocation,
    setProfileLocation,
    city,
    setCity,
    district,
    setDistrict,
    locationMapLink,
    setLocationMapLink,
    showMapPreviewOnBookingPage,
    setShowMapPreviewOnBookingPage,
    profilePortfolio,
    setProfilePortfolio,
    profileAvailability,
    setProfileAvailability,
    bookingSlug,
    setBookingSlug,
    profileImageUrl,
    setProfileImageUrl,
    allowedEventTypes,
    setAllowedEventTypes,
    allowCustomEventTypes,
    setAllowCustomEventTypes,
    universalDepositType,
    setUniversalDepositType,
    universalDepositValue,
    setUniversalDepositValue,
    offlineMessage,
    setOfflineMessage,
    showManualBookingInTopbar,
    setShowManualBookingInTopbar,
    showAcceptBookingsInTopbar,
    setShowAcceptBookingsInTopbar,
    proposalExpirationHours,
    setProposalExpirationHours,
    handleSaveProfile,
    handleToggleAvailability,
  };
}
