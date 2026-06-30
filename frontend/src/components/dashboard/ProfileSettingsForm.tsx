import { Button } from "@/components/ui/button";
import { BookingPageLinkCard } from "./profile/BookingPageLinkCard";
import { BiographyCard } from "./profile/BiographyCard";
import { LocationPortfolioCard } from "./profile/LocationPortfolioCard";
import { EventTypesCard } from "./profile/EventTypesCard";

type Props = {
  bio: string;
  location: string;
  portfolio: string;
  bookingSlug?: string;
  onBioChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onPortfolioChange: (v: string) => void;
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
};

export function ProfileSettingsForm({
  bio,
  location,
  portfolio,
  bookingSlug,
  onBioChange,
  onLocationChange,
  onPortfolioChange,
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
}: Props) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
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
          className="btn btn-primary h-12 px-8 shadow-md rounded-xl font-bold cursor-pointer hover:opacity-90"
        >
          Save Profile Settings
        </Button>
      </div>
    </form>
  );
}

