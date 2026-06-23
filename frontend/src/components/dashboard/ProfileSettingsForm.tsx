import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Check, Upload, X, Plus, Image as ImageIcon } from "lucide-react";

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
};

const PREDEFINED_EVENT_TYPES = [
  "Wedding",
  "Portrait",
  "Engagement",
  "Corporate Event",
  "Newborn",
  "Fashion",
  "Sports",
  "Landscape",
  "Event Party"
];

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
}: Props) {
  const [copied, setCopied] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verify it is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onProfileImageUrlChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onProfileImageUrlChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTogglePredefinedType = (type: string) => {
    if (allowedEventTypes.includes(type)) {
      onAllowedEventTypesChange(allowedEventTypes.filter((t) => t !== type));
    } else {
      onAllowedEventTypesChange([...allowedEventTypes, type]);
    }
  };

  const handleAddCustomType = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanType = customTypeInput.trim();
    if (!cleanType) return;
    if (allowedEventTypes.some((t) => t.toLowerCase() === cleanType.toLowerCase())) {
      setCustomTypeInput("");
      return; // Already added
    }
    onAllowedEventTypesChange([...allowedEventTypes, cleanType]);
    setCustomTypeInput("");
  };

  const handleRemoveType = (type: string) => {
    onAllowedEventTypesChange(allowedEventTypes.filter((t) => t !== type));
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm max-w-2xl mx-auto rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Profile Details</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Customize your biography, photos, services, and booking settings shown to clients.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* Booking slug link share */}
          {bookingSlug && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
              <Label className="text-body-small-s font-semibold text-primary-dark dark:text-primary-light">
                Your Public Booking Page Link
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/book/${bookingSlug}` : ""}
                  className="h-[50px] rounded-xl bg-white dark:bg-zinc-950 font-mono text-xs border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 select-all cursor-text"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/book/${bookingSlug}`;
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn btn-outline h-[50px] px-4 py-0 min-w-0 md:min-w-0 font-medium text-sm text-zinc-700 dark:text-zinc-300 shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Share this link with your customers so they can view your availability, packages, and submit booking requests directly.
              </p>
            </div>
          )}

          {/* Profile Picture section */}
          <div className="space-y-3">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Profile Picture
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-full border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm overflow-hidden flex items-center justify-center">
                {profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImageUrl}
                    alt="Profile Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-zinc-400" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline h-9 px-3 py-0 min-w-0 md:min-w-0 font-medium text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Image
                  </Button>
                  {profileImageUrl && (
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-outline border-red-200 hover:border-red-300 text-red-650 hover:bg-red-50/50 h-9 px-3 py-0 min-w-0 md:min-w-0 font-medium text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500">
                  PNG, JPG, or GIF. Max 5MB. Images are saved locally to your profile.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Description biography */}
          <div className="space-y-2">
            <Label htmlFor="profBio" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Biography & Service Description
            </Label>
            <textarea
              id="profBio"
              rows={4}
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Describe your style, experience, and custom offerings shown to clients..."
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              Fully customize your profile description to entice prospective booking requests.
            </p>
          </div>

          {/* Location & Portfolio */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profLoc" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Base Location</Label>
              <Input
                id="profLoc"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Colombo, Kandy"
                className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profPort" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Portfolio URL</Label>
              <Input
                id="profPort"
                value={portfolio}
                onChange={(e) => onPortfolioChange(e.target.value)}
                placeholder="e.g. https://myportfolio.com"
                className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          {/* Event types definitions section */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                Offered Event Types
              </Label>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                Define the service types that clients can choose from in your booking availability checklist.
              </p>
            </div>

            {/* List active choices */}
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Currently Offered
              </Label>
              {allowedEventTypes.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
                  <p className="text-xs text-zinc-400 italic">No event types defined yet. Select or add one below.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allowedEventTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1 text-xs font-semibold shadow-sm"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => handleRemoveType(type)}
                        className="text-zinc-400 hover:text-zinc-250 dark:text-zinc-600 dark:hover:text-zinc-800 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Predefined Select buttons */}
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Select Predefined Types
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_EVENT_TYPES.map((type) => {
                  const isSelected = allowedEventTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTogglePredefinedType(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-zinc-150 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                          : "border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom manually */}
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Add Custom Event Type
              </Label>
              <div className="flex gap-2">
                <Input
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  placeholder="e.g. Newborn Session, Real Estate, Food"
                  className="h-[50px] rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddCustomType}
                  className="btn btn-outline h-[50px] px-4 flex items-center gap-1.5 border-zinc-200 dark:border-zinc-850"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Switch to allow client-side other event types */}
            <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl mt-3">
              <input
                type="checkbox"
                id="allowCustomTog"
                checked={allowCustomEventTypes}
                onChange={(e) => onAllowCustomEventTypesChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 shrink-0"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="allowCustomTog"
                  className="text-xs font-semibold text-zinc-900 dark:text-white cursor-pointer"
                >
                  Allow custom client event types
                </Label>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-550">
                  If toggled, clients can choose an &quot;Other&quot; option in your Booking Page and define their specific event type if they cannot find it in your list.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-100 dark:border-zinc-850 pt-4 dark:border-zinc-800 flex justify-end">
          <Button
            type="submit"
            className="btn btn-primary h-[50px] py-0 min-w-0 md:min-w-0 px-8 shadow-sm"
          >
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
