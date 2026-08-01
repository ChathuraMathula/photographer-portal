import { Button } from "@/components/ui/button";
import { BookingPageLinkCard } from "./BookingPageLinkCard";
import { BiographyCard } from "./BiographyCard";
import { LocationPortfolioCard } from "./LocationPortfolioCard";
import { EventTypesCard } from "./EventTypesCard";
import { AcceptBookingsToggle } from "./AcceptBookingsToggle";
import { ProfileCalendarLockCard } from "./ProfileCalendarLockCard";
import { type ProfileSettingsFormProps } from "./types";

export function ProfileSettingsForm({
  bio,
  specializations,
  onSpecializationsChange,
  location,
  portfolio,
  bookingSlug,
  city,
  district,
  locationMapLink,
  onBioChange,
  onLocationChange,
  onPortfolioChange,
  onCityChange,
  onDistrictChange,
  onLocationMapLinkChange,
  showMapPreviewOnBookingPage,
  onShowMapPreviewOnBookingPageChange,
  onSubmit,
  profileImageUrl,
  onProfileImageUrlChange,
  allowedEventTypes,
  onAllowedEventTypesChange,
  allowCustomEventTypes,
  onAllowCustomEventTypesChange,
  offlineMessage,
  onOfflineMessageChange,
  profileAvailability,
  onToggleAvailability,
}: ProfileSettingsFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300"
    >
      <AcceptBookingsToggle
        profileAvailability={profileAvailability}
        onToggleAvailability={onToggleAvailability}
      />

      {bookingSlug && <BookingPageLinkCard bookingSlug={bookingSlug} />}

      <BiographyCard
        bio={bio}
        onBioChange={onBioChange}
        specializations={specializations}
        onSpecializationsChange={onSpecializationsChange}
        profileImageUrl={profileImageUrl}
        onProfileImageUrlChange={onProfileImageUrlChange}
        offlineMessage={offlineMessage}
        onOfflineMessageChange={onOfflineMessageChange}
      />

      <LocationPortfolioCard
        location={location}
        onLocationChange={onLocationChange}
        portfolio={portfolio}
        onPortfolioChange={onPortfolioChange}
        city={city}
        onCityChange={onCityChange}
        district={district}
        onDistrictChange={onDistrictChange}
        locationMapLink={locationMapLink}
        onLocationMapLinkChange={onLocationMapLinkChange}
        showMapPreviewOnBookingPage={showMapPreviewOnBookingPage}
        onShowMapPreviewOnBookingPageChange={
          onShowMapPreviewOnBookingPageChange
        }
      />

      <ProfileCalendarLockCard />

      <EventTypesCard
        allowedEventTypes={allowedEventTypes}
        onAllowedEventTypesChange={onAllowedEventTypesChange}
        allowCustomEventTypes={allowCustomEventTypes}
        onAllowCustomEventTypesChange={onAllowCustomEventTypesChange}
      />

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="btn btn-primary h-11 px-8 font-semibold shadow-md cursor-pointer hover:shadow-lg transition-all"
        >
          Save Profile
        </Button>
      </div>
    </form>
  );
}
