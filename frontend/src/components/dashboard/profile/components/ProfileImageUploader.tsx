import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProfileImageUpload } from "../hooks/useProfileImageUpload";

type Props = {
  profileImageUrl: string;
  onProfileImageUrlChange: (v: string) => void;
};

export function ProfileImageUploader({
  profileImageUrl,
  onProfileImageUrlChange,
}: Props) {
  const { fileInputRef, handleImageUpload, handleRemoveImage } =
    useProfileImageUpload(onProfileImageUrlChange);
  return (
    <div className="space-y-3">
      <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
        Profile Picture
      </Label>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 rounded-full border border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm overflow-hidden flex items-center justify-center">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Preview"
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
              <Upload className="h-3.5 w-3.5" /> Upload Image
            </Button>
            {profileImageUrl && (
              <Button
                type="button"
                onClick={handleRemoveImage}
                variant="outline"
                className="h-9 px-3 rounded-xl font-medium text-body-caption border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <p className="text-body-caption text-zinc-455 dark:text-zinc-500">
            PNG, JPG, or GIF. Max 5MB. Images are saved locally.
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
  );
}
