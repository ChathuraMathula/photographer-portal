import { Button } from "@/components/ui/button";
import { BookingPageLinkCard } from "./profile/BookingPageLinkCard";
import { BiographyCard } from "./profile/BiographyCard";
import { LocationPortfolioCard } from "./profile/LocationPortfolioCard";
import { EventTypesCard } from "./profile/EventTypesCard";
import { AcceptBookingsConfirmModal } from "./AcceptBookingsConfirmModal";
import { useState } from "react";

import { TopBarPreferencesCard } from "./profile/TopBarPreferencesCard";

type Props = {
  bio: string;
  location: string;
  portfolio: string;
  bookingSlug?: string;
  city?: string;
  district?: string;
  locationMapLink?: string;
  onBioChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onPortfolioChange: (v: string) => void;
  onCityChange?: (v: string) => void;
  onDistrictChange?: (v: string) => void;
  onLocationMapLinkChange?: (v: string) => void;
  showMapPreviewOnBookingPage: boolean;
  onShowMapPreviewOnBookingPageChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  profileImageUrl: string;
  onProfileImageUrlChange: (v: string) => void;
  allowedEventTypes: string[];
  onAllowedEventTypesChange: (v: string[]) => void;
  allowCustomEventTypes: boolean;
  onAllowCustomEventTypesChange: (v: boolean) => void;
  universalDepositType: string;
  universalDepositValue: number;
  onUniversalDepositTypeChange: (v: string) => void;
  onUniversalDepositValueChange: (v: number) => void;
  offlineMessage: string;
  onOfflineMessageChange: (v: string) => void;
  profileAvailability: boolean;
  onToggleAvailability: () => void;
};

export function ProfileSettingsForm({
  bio,
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
  universalDepositType,
  universalDepositValue,
  onUniversalDepositTypeChange,
  onUniversalDepositValueChange,
  offlineMessage,
  onOfflineMessageChange,
  profileAvailability,
  onToggleAvailability,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Accept Bookings Toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-2xl">
        <div className="space-y-1">
          <p className="text-body-small-s font-bold text-zinc-900 dark:text-white">Accepting Bookings</p>
          <p className="text-[11px] text-zinc-500">Toggle your availability to pause or resume incoming requests.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (profileAvailability) {
              setShowConfirmModal(true);
            } else {
              onToggleAvailability();
            }
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            profileAvailability ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
          }`}
          aria-label="Toggle bookings"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              profileAvailability ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Card 1: Public Booking Page Link */}
      {bookingSlug && <BookingPageLinkCard bookingSlug={bookingSlug} />}

      {/* Card 2: Biography & Portrait Photo */}
      <BiographyCard
        bio={bio}
        onBioChange={onBioChange}
        profileImageUrl={profileImageUrl}
        onProfileImageUrlChange={onProfileImageUrlChange}
        offlineMessage={offlineMessage}
        onOfflineMessageChange={onOfflineMessageChange}
      />

      {/* Card 3: Location & Portfolio */}
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
        onShowMapPreviewOnBookingPageChange={onShowMapPreviewOnBookingPageChange}
      />

      {/* Card 5: Service Offerings & Event Types */}
      <EventTypesCard
        allowedEventTypes={allowedEventTypes}
        onAllowedEventTypesChange={onAllowedEventTypesChange}
        allowCustomEventTypes={allowCustomEventTypes}
        onAllowCustomEventTypesChange={onAllowCustomEventTypesChange}
      />

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="btn btn-primary h-11 px-8 font-semibold shadow-md cursor-pointer hover:shadow-lg transition-all"
        >
          Save Profile
        </Button>
      </div>

      <AcceptBookingsConfirmModal
        open={showConfirmModal}
        onConfirm={() => {
          setShowConfirmModal(false);
          onToggleAvailability();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />
    </form>
  );
}
