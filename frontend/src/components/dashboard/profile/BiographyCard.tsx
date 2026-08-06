"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileImageUploader } from "./components/ProfileImageUploader";
import { BannerImageUploader } from "./components/BannerImageUploader";

type BiographyCardProps = {
  bio: string;
  onBioChange: (v: string) => void;
  specializations?: string[];
  onSpecializationsChange?: (v: string[]) => void;
  profileImageUrl: string;
  onProfileImageUrlChange: (v: string) => void;
  coverImageUrl?: string;
  onCoverImageUrlChange?: (v: string) => void;
  userRole?: string;
  offlineMessage: string;
  onOfflineMessageChange: (v: string) => void;
};

export function BiographyCard({
  bio,
  onBioChange,
  specializations = [],
  onSpecializationsChange,
  profileImageUrl,
  onProfileImageUrlChange,
  coverImageUrl = "",
  onCoverImageUrlChange,
  userRole,
  offlineMessage,
  onOfflineMessageChange,
}: BiographyCardProps) {
  const isStaff = userRole === "STUDIO_STAFF" || userRole === "STUDIO_PHOTOGRAPHER";

  const [newSpecInput, setNewSpecInput] = React.useState("");

  const handleAddSpecialization = () => {
    const trimmed = newSpecInput.trim();
    if (trimmed && !specializations.includes(trimmed) && onSpecializationsChange) {
      onSpecializationsChange([...specializations, trimmed]);
      setNewSpecInput("");
    }
  };

  const handleRemoveSpecialization = (tagToRemove: string) => {
    if (onSpecializationsChange) {
      onSpecializationsChange(specializations.filter((tag) => tag !== tagToRemove));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSpecialization();
    }
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">
          Biography & Portrait
        </CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          {isStaff
            ? "Upload your profile picture and customize your personal details."
            : "Customize your professional portrait, cover banner, style bio, specializations, and offline message."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <ProfileImageUploader
          profileImageUrl={profileImageUrl}
          onProfileImageUrlChange={onProfileImageUrlChange}
        />

        {!isStaff && onCoverImageUrlChange && (
          <BannerImageUploader
            coverImageUrl={coverImageUrl}
            onCoverImageUrlChange={onCoverImageUrlChange}
          />
        )}
        <div className="space-y-2">
          <Label
            htmlFor="profBio"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
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
          <Label
            htmlFor="specializations"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Specializations{" "}
            <span className="text-zinc-400 font-normal">(e.g. Wedding, Portrait, Wildlife)</span>
          </Label>
          
          {/* Display current specializations as tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {specializations.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-dark/10 text-primary-dark dark:bg-primary-dark/20 dark:text-primary-light border border-primary-dark/20"
              >
                {spec}
                {onSpecializationsChange && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(spec)}
                    className="hover:text-red-500 transition-colors focus:outline-none"
                    aria-label={`Remove ${spec}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              id="specializations"
              type="text"
              value={newSpecInput}
              onChange={(e) => setNewSpecInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a specialization and press Enter or comma..."
              className="flex-1 rounded-xl border border-zinc-200 bg-white p-3 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
            <button
              type="button"
              onClick={handleAddSpecialization}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-body-small font-medium transition-all"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="offlineMsg"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Custom Offline Message{" "}
            <span className="text-zinc-400 font-normal">(optional)</span>
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
