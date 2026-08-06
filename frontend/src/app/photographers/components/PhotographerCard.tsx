"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StarRating } from "./StarRating";
import { PhotographerProfileItem } from "../types";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  CalendarCheck,
  Star,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Camera,
  Building2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";

interface PhotographerCardProps {
  photographer: PhotographerProfileItem;
  onOpenRateModal: (photographer: PhotographerProfileItem) => void;
}

export function PhotographerCard({
  photographer,
  onOpenRateModal,
}: PhotographerCardProps) {
  const [copied, setCopied] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  const fullName = photographer.user
    ? `${photographer.user.firstName} ${photographer.user.lastName}`
    : "Professional Photographer";

  const initials = photographer.user
    ? `${photographer.user.firstName?.charAt(0) || ""}${photographer.user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "P";

  const bookingUrl = `/book/${photographer.bookingSlug}`;

  // Parse specializations cleanly
  let specArray: string[] = [];
  if (Array.isArray(photographer.specializations)) {
    specArray = photographer.specializations;
  } else if (typeof photographer.specializations === "string" && photographer.specializations) {
    specArray = (photographer.specializations as string).split(",").map((s: string) => s.trim());
  }

  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}${bookingUrl}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    toast.success("Booking link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuperAdmin = auth.role === "SUPER_ADMIN";

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Header Banner Background */}
      <div className="h-28 w-full bg-gradient-to-r from-[#0e2d5c] via-blue-900 to-slate-900 relative p-4 flex items-start justify-between gap-2">
        {/* Availability Badge & Studio Badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 ${
              photographer.isAvailableForBooking
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                photographer.isAvailableForBooking
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            {photographer.isAvailableForBooking
              ? "Available"
              : "Unavailable"}
          </span>

          {photographer.studioName && (
            <Link
              href={`/studios/${photographer.studioSlug || photographer.studioName.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 backdrop-blur-md flex items-center gap-1 hover:bg-indigo-500/50 transition-colors"
            >
              {photographer.studioLogoUrl ? (
                <img
                  src={photographer.studioLogoUrl}
                  alt={photographer.studioName}
                  className="h-3 w-3 rounded-full object-cover shrink-0"
                />
              ) : (
                <Building2 className="h-3 w-3 text-indigo-300 shrink-0" />
              )}
              <span className="truncate max-w-[100px]">{photographer.studioName}</span>
            </Link>
          )}
        </div>

        {/* Super Admin Placeholder / Badge */}
        {isSuperAdmin && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-purple-300" />
            Super Admin Access
          </span>
        )}
      </div>

      {/* Avatar & Card Details */}
      <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Profile Avatar */}
          <div className="-mt-12 flex items-end justify-between">
            <Link href={`/photographers/${photographer.bookingSlug}`} className="relative block group-hover:scale-105 transition-transform">
              <UserAvatar
                src={photographer.profileImageUrl}
                name={fullName}
                className="h-20 w-20 rounded-full border-4 border-white dark:border-zinc-900 shadow-md text-2xl"
              />
            </Link>

            {/* Star Rating Display */}
            <div className="flex flex-col items-end">
              <StarRating
                rating={photographer.rating || 4.8}
                count={photographer.ratingCount || 12}
                size="sm"
              />
              <button
                type="button"
                onClick={() => onOpenRateModal(photographer)}
                className="mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                Rate Photographer
              </button>
            </div>
          </div>

          {/* Name & Location */}
          <div>
            <Link href={`/photographers/${photographer.bookingSlug}`} className="block">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {fullName}
              </h3>
            </Link>
            {(photographer.city || photographer.baseLocation) && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>
                  {[photographer.city, photographer.district, photographer.baseLocation]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}
          </div>

          {/* Bio */}
          {photographer.bio && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
              {photographer.bio}
            </p>
          )}

          {/* Specializations Chips */}
          {specArray.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specArray.slice(0, 4).map((spec, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                >
                  {spec}
                </span>
              ))}
              {specArray.length > 4 && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400">
                  +{specArray.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-6 mt-4 border-t border-zinc-150 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href={bookingUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#0e2d5c] hover:bg-[#0b244a] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Book Session</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Booking Link"
              className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
