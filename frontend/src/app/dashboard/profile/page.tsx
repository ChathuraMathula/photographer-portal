"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { AdminProfilePage } from "@/components/dashboard/profile/AdminProfilePage";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

export default function ProfilePage() {
  const { role } = useSelector((state: RootState) => state.auth);
  const context = usePhotographerDashboardContext();

  // If Admin or Super Admin, render Admin profile directly
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return <AdminProfilePage />;
  }

  // Fallback for Photographer role
  if (!context) return null;

  const {
    profileBio,
    profileLocation,
    profilePortfolio,
    bookingSlug,
    city,
    district,
    locationMapLink,
    setProfileBio,
    setProfileLocation,
    setCity,
    setDistrict,
    setLocationMapLink,
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
    profileAvailability,
    handleToggleAvailability,
  } = context;

  return (
    <ProfileSettingsForm
      bio={profileBio}
      location={profileLocation}
      portfolio={profilePortfolio}
      bookingSlug={bookingSlug}
      city={city}
      district={district}
      locationMapLink={locationMapLink}
      showMapPreviewOnBookingPage={context.showMapPreviewOnBookingPage}
      onBioChange={setProfileBio}
      onLocationChange={setProfileLocation}
      onPortfolioChange={setProfilePortfolio}
      onCityChange={setCity}
      onDistrictChange={setDistrict}
      onLocationMapLinkChange={setLocationMapLink}
      onShowMapPreviewOnBookingPageChange={
        context.setShowMapPreviewOnBookingPage
      }
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
      profileAvailability={profileAvailability}
      onToggleAvailability={handleToggleAvailability}
    />
  );
}
