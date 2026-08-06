"use client";

import React, { useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Props = {
  coverImageUrl: string;
  onCoverImageUrlChange: (v: string) => void;
};

export function BannerImageUploader({
  coverImageUrl,
  onCoverImageUrlChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/uploads/image?type=banner`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload banner image");
      }

      const data = await res.json();
      onCoverImageUrlChange(data.url);
      toast.success("Cover banner uploaded & converted to WebP successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload banner image.");
    }
  };

  const handleRemoveBanner = () => {
    onCoverImageUrlChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
        Cover Banner Image
      </Label>
      <div className="space-y-3">
        <div className="relative h-32 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-[#0e2d5c] to-indigo-900 overflow-hidden flex items-center justify-center shadow-inner">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="Banner Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-zinc-300 text-xs font-semibold">
              <ImageIcon className="h-6 w-6 text-zinc-400" />
              <span>No cover banner photo set</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="h-9 px-3 rounded-xl font-medium text-body-caption text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Cover Banner
          </Button>
          {coverImageUrl && (
            <Button
              type="button"
              onClick={handleRemoveBanner}
              variant="outline"
              className="h-9 px-3 rounded-xl font-medium text-body-caption border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
        <p className="text-body-caption text-zinc-400">
          Recommended: 1920x1080px. Converted to WebP and compressed automatically.
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleBannerUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
