"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PhotographersHeader } from "@/app/photographers/components/PhotographersHeader";
import { StarRating } from "@/app/photographers/components/StarRating";
import { RatingModal } from "@/app/photographers/components/RatingModal";
import { OSMMapPreview } from "@/components/maps/OSMMapPreview";
import { PhotographerProfileItem } from "@/app/photographers/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  MapPin,
  CalendarCheck,
  Star,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  ArrowLeft,
  Sparkles,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface PhotographerProfileFull {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  phone?: string;
  bookingSlug: string;
  bio?: string;
  city?: string;
  district?: string;
  baseLocation?: string;
  locationMapLink?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  specializations?: string[] | string;
  rating?: number;
  ratingCount?: number;
  isAvailableForBooking?: boolean;
  offlineMessage?: string;
  allowedEventTypes?: string[];
  studioName?: string;
  studioSlug?: string;
  studioLogoUrl?: string;
}

export default function PhotographerProfileSocialPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [profile, setProfile] = useState<PhotographerProfileFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPhotographerProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        
        // Fetch from public booking profile endpoint
        const res = await fetch(`${API}/bookings/${slug}`);
        if (!res.ok) {
          throw new Error("Photographer profile not found");
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load photographer profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographerProfile();
  }, [slug]);

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Photographer Profile";
  const initials = profile ? `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() : "P";

  let specArray: string[] = [];
  if (profile?.specializations) {
    if (Array.isArray(profile.specializations)) {
      specArray = profile.specializations;
    } else if (typeof profile.specializations === "string") {
      specArray = profile.specializations.split(",").map((s) => s.trim());
    }
  }

  const bookingUrl = `/book/${slug}`;

  const handleCopyProfileUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Profile URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submitRating = async (profileId: string, rating: number) => {
    if (!slug) return;
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    await fetch(`${API}/photographers/public/${slug}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    setProfile((prev) => (prev ? { ...prev, ratingCount: (prev.ratingCount || 0) + 1 } : null));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col animate-in fade-in duration-300">
      <PhotographersHeader searchTerm="" onSearchChange={() => {}} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/photography"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Photography Directory
          </Link>
        </div>

        {loading ? (
          <div className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        ) : error || !profile ? (
          <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl">
            <div className="max-w-sm mx-auto space-y-3">
              <Camera className="h-10 w-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Photographer Profile Not Found
              </h3>
              <p className="text-xs text-zinc-500">
                The requested profile does not exist or may currently be under review.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* SOCIAL MEDIA HERO PROFILE HEADER (Facebook / Instagram style) */}
            <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              {/* Cover Banner */}
              <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-slate-900 relative p-4 sm:p-6 flex items-start justify-between">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-inner flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Verified Creative Photographer
                  </span>
                </div>

                {/* Cover actions */}
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyProfileUrl}
                    className="h-8 px-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Share Profile"}</span>
                  </Button>
                </div>
              </div>

              {/* Profile Avatar & Header Details Bar */}
              <div className="px-6 sm:px-8 pb-6 pt-0 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
                  {/* Left: Avatar & Main Info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                    <div className="relative shrink-0">
                      <UserAvatar
                        src={profile.profileImageUrl}
                        name={fullName}
                        className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-white dark:border-zinc-900 shadow-2xl text-3xl sm:text-4xl"
                      />

                      {/* Status Dot */}
                      <span
                        className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white dark:border-zinc-900 shadow-md ${
                          profile.isAvailableForBooking ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                        title={profile.isAvailableForBooking ? "Available for Booking" : "Unavailable"}
                      />
                    </div>

                    <div className="space-y-1.5 pb-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                          {fullName}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 uppercase tracking-wider">
                          Solo Photographer
                        </span>
                      </div>

                      {profile.username && (
                        <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          @{profile.username}
                        </p>
                      )}

                      {(profile.city || profile.district || profile.baseLocation) && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span>
                            {[profile.city, profile.district, profile.baseLocation]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Primary Book CTA & Rating */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 self-center md:self-end">
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                      <StarRating
                        rating={profile.rating || 4.8}
                        count={profile.ratingCount || 12}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => setRateModalOpen(true)}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer ml-1"
                      >
                        Rate
                      </button>
                    </div>

                    {/* BOOK SESSION PRIMARY CTA BUTTON */}
                    <Link href={bookingUrl}>
                      <Button className="h-12 px-7 bg-gradient-to-r from-[#0e2d5c] to-indigo-700 hover:from-[#091e3d] hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all gap-2 cursor-pointer">
                        <CalendarCheck className="h-4 w-4" />
                        <span>Book Session</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* TWO COLUMN SOCIAL PROFILE LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN: About & Specializations & Location */}
              <div className="lg:col-span-2 space-y-6">
                {/* About & Biography Card */}
                <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    About Photographer & Bio
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {profile.bio || "This photographer has not added a detailed biography yet, but is actively accepting client bookings."}
                  </p>
                </Card>

                {/* Specializations & Styles Card */}
                {specArray.length > 0 && (
                  <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-3">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Specializations & Photography Styles
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {specArray.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60 flex items-center gap-1.5"
                        >
                          <Sparkles className="h-3 w-3 text-indigo-500" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Location Details & Interactive Map Preview */}
                <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      Base Location & Coverage Map
                    </h3>
                    <span className="text-xs text-zinc-400 font-bold">
                      {[profile.city, profile.district].filter(Boolean).join(", ") || "Base Location"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      <strong>Address / City:</strong> {profile.baseLocation || profile.city || "Location available upon booking"}
                    </p>

                    {/* Interactive Map Preview */}
                    <OSMMapPreview
                      location={profile.baseLocation}
                      city={profile.city}
                      district={profile.district}
                      locationMapLink={profile.locationMapLink}
                      height="240px"
                    />

                    {profile.locationMapLink && (
                      <div className="pt-2 flex justify-end">
                        <a
                          href={profile.locationMapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Open in Google Maps
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* RIGHT COLUMN: Quick Booking Sidebar Card */}
              <div className="space-y-6">
                {/* Book Session Sidebar Card */}
                <Card className="border border-indigo-200 dark:border-indigo-900/60 shadow-lg bg-gradient-to-b from-indigo-50/70 via-white to-white dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-900 rounded-3xl p-6 space-y-5">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <CalendarCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Book a Photography Session
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Select date, duration, and event type to reserve directly.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Availability Status
                      </span>
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        profile.isAvailableForBooking ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {profile.isAvailableForBooking ? "Active & Accepting Bookings" : "Paused"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700/50 pt-2.5">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-500" /> Booking Confirmation
                      </span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Instant Online</span>
                    </div>
                  </div>

                  {/* PROMINENT BOOK SESSION BUTTON */}
                  <Link href={bookingUrl} className="block w-full">
                    <Button className="w-full h-12 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-extrabold text-xs rounded-2xl shadow-md gap-2 cursor-pointer">
                      <CalendarCheck className="h-4 w-4" />
                      <span>Proceed to Book Session</span>
                    </Button>
                  </Link>
                </Card>

                {/* Studio Affiliation Card (if studio member) */}
                {profile.studioName && (
                  <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Studio Affiliation
                    </h4>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {profile.studioLogoUrl ? (
                          <img
                            src={profile.studioLogoUrl}
                            alt={profile.studioName}
                            className="h-10 w-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                            <Building2 className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                            {profile.studioName}
                          </span>
                          <span className="text-[11px] text-zinc-500">Verified Studio Member</span>
                        </div>
                      </div>

                      {profile.studioSlug && (
                        <Link
                          href={`/studios/${profile.studioSlug}`}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Studio
                        </Link>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rating Modal */}
      {profile && (
        <RatingModal
          photographer={profile as any}
          isOpen={rateModalOpen}
          onClose={() => setRateModalOpen(false)}
          onSubmitRating={submitRating}
        />
      )}
    </div>
  );
}
