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
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">
          Biography & Portrait
        </CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          Customize your professional portrait, style bio, and offline message.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <ProfileImageUploader
          profileImageUrl={profileImageUrl}
          onProfileImageUrlChange={onProfileImageUrlChange}
        />
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
