"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
import { AdminProfilePage } from "@/components/dashboard/profile/AdminProfilePage";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ADMIN_MENU } from "@/components/dashboard/AdminDashboard";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { start } = useTopLoadingBar();
  const { role, firstName } = useSelector((state: RootState) => state.auth);
  
  const context = usePhotographerDashboardContext();

  const handleLogout = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout error:", err);
    }
    dispatch(logout());
    window.location.href = "/login";
  };

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "overview") router.push("/dashboard");
    else if (tab === "reports") router.push("/dashboard/reports");
    else if (tab === "profile") router.push("/dashboard/profile");
    else router.push("/dashboard/users");
  };

  // If Admin or Super Admin, render Admin profile wrapped in DashboardLayout
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <DashboardLayout
        activeTab="profile"
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userName={firstName ?? ""}
        userRole={role ?? ""}
        menuItems={ADMIN_MENU}
      >
        <AdminProfilePage />
      </DashboardLayout>
    );
  }

  // Fallback for Photographer role
  if (!context) return null;

  const {
    profileBio,
    profileLocation,
    profilePortfolio,
    bookingSlug,
    setProfileBio,
    setProfileLocation,
    setProfilePortfolio,
    handleSaveProfile,
    profileImageUrl,
    setProfileImageUrl,
    allowedEventTypes,
    setAllowedEventTypes,
    allowCustomEventTypes,
    setAllowCustomEventTypes,
    universalDepositType,
    universalDepositValue,
    setUniversalDepositType,
    setUniversalDepositValue,
    offlineMessage,
    setOfflineMessage,
  } = context;

  return (
    <ProfileSettingsForm
      bio={profileBio}
      location={profileLocation}
      portfolio={profilePortfolio}
      bookingSlug={bookingSlug}
      onBioChange={setProfileBio}
      onLocationChange={setProfileLocation}
      onPortfolioChange={setProfilePortfolio}
      onSubmit={handleSaveProfile}
      profileImageUrl={profileImageUrl}
      onProfileImageUrlChange={setProfileImageUrl}
      allowedEventTypes={allowedEventTypes}
      onAllowedEventTypesChange={setAllowedEventTypes}
      allowCustomEventTypes={allowCustomEventTypes}
      onAllowCustomEventTypesChange={setAllowCustomEventTypes}
      universalDepositType={universalDepositType}
      universalDepositValue={universalDepositValue}
      onUniversalDepositTypeChange={setUniversalDepositType}
      onUniversalDepositValueChange={setUniversalDepositValue}
      offlineMessage={offlineMessage}
      onOfflineMessageChange={setOfflineMessage}
    />
  );
}
