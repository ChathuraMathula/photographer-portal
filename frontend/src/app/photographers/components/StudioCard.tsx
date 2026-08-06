import { UserAvatar } from "@/components/common/UserAvatar";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  CalendarCheck,
  Building2,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export interface StudioItem {
  id: string;
  studioName: string;
  studioSlug: string;
  studioLogoUrl?: string;
  managerName?: string;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  baseLocation?: string;
  description?: string;
  subscriptionPlan?: string;
}

interface StudioCardProps {
  studio: StudioItem;
}

export function StudioCard({ studio }: StudioCardProps) {
  const [copied, setCopied] = useState(false);

  const bookingUrl = `/book/${studio.studioSlug}`;
  const profileUrl = `/studios/${studio.studioSlug}`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const fullLink = `${window.location.origin}${bookingUrl}`;
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      toast.success("Studio booking link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const initial = studio.studioName?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-600/60 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Header Banner Background */}
      <div className="h-28 w-full bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-purple-950 relative p-4 flex items-start justify-between gap-2">
        {/* Prominent Studio Badge */}
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-100 border border-indigo-400/40 backdrop-blur-md flex items-center gap-1.5 shadow-xs">
          <Building2 className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
          <span>Verified Studio & Agency</span>
        </span>

        {/* Verified Badge */}
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-300" />
          Verified
        </span>
      </div>

      {/* Avatar & Card Details */}
      <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Studio Avatar Logo */}
          <div className="-mt-12 flex items-end justify-between">
            <Link href={profileUrl} className="relative block group-hover:scale-105 transition-transform">
              <UserAvatar
                src={studio.studioLogoUrl}
                name={studio.studioName}
                className="h-20 w-20 rounded-full border-4 border-white dark:border-zinc-900 shadow-md text-2xl"
              />
            </Link>
          </div>

          {/* Name & Location */}
          <div>
            <Link href={profileUrl} className="block">
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {studio.studioName}
              </h3>
            </Link>
            {(studio.city || studio.district || studio.baseLocation) && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>
                  {[studio.city, studio.district, studio.baseLocation]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}
          </div>

          {/* Description */}
          {studio.description && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
              {studio.description}
            </p>
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
              <span>Book Studio</span>
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
