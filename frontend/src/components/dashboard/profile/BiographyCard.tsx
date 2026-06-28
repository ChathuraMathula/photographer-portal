"use client";

import React, { useRef } from "react";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BiographyCardProps = {
  bio: string;
  onBioChange: (v: string) => void;
  profileImageUrl: string;
  onProfileImageUrlChange: (v: string) => void;
  offlineMessage: string;
  onOfflineMessageChange: (v: string) => void;
};

export function BiographyCard({
  bio,
  onBioChange,
  profileImageUrl,
  onProfileImageUrlChange,
  offlineMessage,
  onOfflineMessageChange,
}: BiographyCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
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
  );
}
