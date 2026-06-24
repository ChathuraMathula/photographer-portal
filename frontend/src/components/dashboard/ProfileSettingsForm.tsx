import { useState, useRef } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  universalDepositType,
  universalDepositValue,
  onUniversalDepositTypeChange,
  onUniversalDepositValueChange,
  offlineMessage,
  onOfflineMessageChange,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verify it is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Max dimension for profile image (reduced size but good resolution)
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress with JPEG format and 0.7 quality
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
            onProfileImageUrlChange(compressedDataUrl);
            toast.success("Profile image uploaded and compressed successfully!");
          } else {
            onProfileImageUrlChange(reader.result as string);
            toast.warning("Profile image uploaded without compression.");
          }
        };
        img.onerror = () => {
          toast.error("Failed to load image for compression.");
        };
        img.src = reader.result as string;
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
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Card 1: Public Booking Page Link */}
      {bookingSlug && (
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
            <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Public Booking Page Link</CardTitle>
            <CardDescription className="text-body-caption text-zinc-500 mt-1">
              Share this link with your customers so they can view your availability, packages, and submit booking requests directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/book/${bookingSlug}` : ""}
                className="h-11 w-full min-w-0 rounded-xl bg-white dark:bg-zinc-950 font-mono text-body-caption border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 select-all cursor-text"
              />
              <Button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/book/${bookingSlug}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn btn-outline h-11 px-4 py-0 min-w-0 md:min-w-0 font-medium text-body-small-s text-zinc-700 dark:text-zinc-300 shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5"
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
          </CardContent>
        </Card>
      )}

      {/* Card 2: Biography & Portrait Photo */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
          <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Biography & Portrait</CardTitle>
          <CardDescription className="text-body-caption text-zinc-500 mt-1">
            Customize your professional portrait, style bio, and offline message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
                    variant="outline"
                    className="h-9 px-3 rounded-xl font-medium text-body-caption text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Image
                  </Button>
                  {profileImageUrl && (
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      variant="outline"
                      className="h-9 px-3 rounded-xl font-medium text-body-caption border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-body-caption text-zinc-455 dark:text-zinc-500">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="offlineMsg" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Custom Offline Message <span className="text-zinc-400 font-normal">(optional)</span>
            </Label>
            <textarea
              id="offlineMsg"
              rows={3}
              value={offlineMessage}
              onChange={(e) => onOfflineMessageChange(e.target.value)}
              placeholder="Describe what clients should see when Accept Bookings is toggled off..."
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Location & Portfolio */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
          <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Location & Portfolio</CardTitle>
          <CardDescription className="text-body-caption text-zinc-500 mt-1">
            Specify where you operate and showcase where clients can view more of your photography work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profLoc" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Base Location</Label>
              <Input
                id="profLoc"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Colombo, Kandy"
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profPort" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Portfolio URL</Label>
              <Input
                id="profPort"
                value={portfolio}
                onChange={(e) => onPortfolioChange(e.target.value)}
                placeholder="e.g. https://myportfolio.com"
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Default Deposit Policy */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-855 bg-zinc-50/20">
          <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Default Deposit Policy</CardTitle>
          <CardDescription className="text-body-caption text-zinc-500 mt-1">
            Configure a default deposit amount (fixed LKR or percentage of total package price) used when sending proposals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="universalDepositType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                Deposit Rule Type
              </Label>
              <Select
                value={universalDepositType}
                onValueChange={onUniversalDepositTypeChange}
              >
                <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 text-body-small border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <SelectItem value="fixed" className="cursor-pointer">Fixed Price (LKR)</SelectItem>
                  <SelectItem value="percentage" className="cursor-pointer">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="universalDepositValue" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                {universalDepositType === "fixed" ? "Deposit Amount (LKR)" : "Deposit Percentage (%)"}
              </Label>
              <Input
                id="universalDepositValue"
                type="number"
                min="0"
                max={universalDepositType === "percentage" ? "100" : undefined}
                value={universalDepositValue}
                onChange={(e) => onUniversalDepositValueChange(Number(e.target.value))}
                placeholder={universalDepositType === "fixed" ? "e.g. 5000" : "e.g. 10"}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 5: Service Offerings & Event Types */}
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
          <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Service Offerings &amp; Event Types</CardTitle>
          <CardDescription className="text-body-caption text-zinc-500 mt-1">
            Define the service types that clients can choose from in your booking availability checklist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-body-caption font-semibold text-zinc-500 uppercase tracking-wider">
              Currently Offered
            </Label>
            {allowedEventTypes.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
                <p className="text-body-caption text-zinc-400 italic">No event types defined yet. Select or add one below.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allowedEventTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1 text-body-caption font-semibold shadow-sm"
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => handleRemoveType(type)}
                      className="text-zinc-400 hover:text-zinc-250 dark:text-zinc-650 dark:hover:text-zinc-850 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-body-caption font-semibold text-zinc-500 uppercase tracking-wider">
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
                    className={`px-3 py-1 rounded-lg text-body-caption font-medium border transition-all cursor-pointer ${
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

          <div className="space-y-2">
            <Label className="text-body-caption font-semibold text-zinc-500 uppercase tracking-wider">
              Add Custom Event Type
            </Label>
            <div className="flex gap-2">
              <Input
                value={customTypeInput}
                onChange={(e) => setCustomTypeInput(e.target.value)}
                placeholder="e.g. Newborn Session, Real Estate, Food"
                className="h-11 w-full min-w-0 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 text-body-small-s"
              />
              <Button
                type="button"
                onClick={handleAddCustomType}
                className="btn btn-outline h-11 px-4 flex items-center gap-1.5 border-zinc-200 dark:border-zinc-850"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

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
                className="text-body-caption font-semibold text-zinc-900 dark:text-white cursor-pointer"
              >
                Allow custom client event types
              </Label>
              <p className="text-body-caption text-zinc-455 dark:text-zinc-550">
                If toggled, clients can choose an &quot;Other&quot; option in your Booking Page and define their specific event type if they cannot find it in your list.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
