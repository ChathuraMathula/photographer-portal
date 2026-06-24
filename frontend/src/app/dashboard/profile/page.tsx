"use client";

import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";

export default function ProfilePage() {
  const context = usePhotographerDashboardContext();
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
