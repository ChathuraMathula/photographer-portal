"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PhotographersHeader } from "@/app/photographers/components/PhotographersHeader";
import { PhotographerCard } from "@/app/photographers/components/PhotographerCard";
import { PhotographerProfileItem } from "@/app/photographers/types";
import { OSMMapPreview } from "@/components/maps/OSMMapPreview";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
  CalendarCheck,
  MapPin,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  UserCheck,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

interface StudioDetail {
  id: string;
  studioName: string;
  studioSlug: string;
  studioLogoUrl?: string;
  managerName: string;
  email: string;
  phone?: string;
  city?: string;
  district?: string;
  baseLocation?: string;
  locationMapLink?: string;
  description?: string;
  subscriptionPlan: string;
  photographers: PhotographerProfileItem[];
}

export default function StudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [studio, setStudio] = useState<StudioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchStudioDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${API}/studios/public/${slug}`);
        if (!res.ok) {
          throw new Error("Studio profile not found");
        }
        const data = await res.json();
        setStudio(data);
      } catch (err: any) {
        setError(err.message || "Failed to load studio profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudioDetail();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Studio profile link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const bookingUrl = `/book/${slug}`;

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
        ) : error || !studio ? (
          <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl">
            <div className="max-w-sm mx-auto space-y-3">
              <Building2 className="h-10 w-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Studio Profile Not Found
              </h3>
              <p className="text-xs text-zinc-500">
                The requested studio profile could not be found or is inactive.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* SOCIAL MEDIA HERO STUDIO PROFILE HEADER */}
            <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              {/* Cover Banner */}
              <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-purple-950 relative p-4 sm:p-6 flex items-start justify-between">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-inner flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Verified Studio Network
                  </span>
                </div>

                {/* Cover Actions */}
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8 px-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Share Studio"}</span>
                  </Button>
                </div>
              </div>

              {/* Profile Avatar & Header Details Bar */}
              <div className="px-6 sm:px-8 pb-6 pt-0 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
                  {/* Left: Logo Avatar & Info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                    <div className="relative shrink-0">
                      {studio.studioLogoUrl ? (
                        <img
                          src={studio.studioLogoUrl}
                          alt={studio.studioName}
                          className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-white dark:border-zinc-900 shadow-2xl bg-zinc-100"
                        />
                      ) : (
                        <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-600 text-white font-black text-3xl sm:text-4xl border-4 border-white dark:border-zinc-900 shadow-2xl flex items-center justify-center">
                          {studio.studioName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pb-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                          {studio.studioName}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          Verified Agency
                        </span>
                      </div>

                      {(studio.city || studio.district || studio.baseLocation) && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span>
                            {[studio.city, studio.district, studio.baseLocation]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </p>
                      )}

                      <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-zinc-500 pt-0.5 flex-wrap font-medium">
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-indigo-500" /> {studio.email}</span>
                        {studio.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-indigo-500" /> {studio.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Primary Book CTA */}
                  <div className="shrink-0 self-center md:self-end">
                    <Link href={bookingUrl}>
                      <Button className="h-12 px-7 bg-gradient-to-r from-[#0e2d5c] to-indigo-700 hover:from-[#091e3d] hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all gap-2 cursor-pointer">
                        <CalendarCheck className="h-4.5 w-4.5" />
                        <span>Book Studio Session</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* TWO COLUMN SOCIAL PROFILE LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN: About, Location & Staff Photographers */}
              <div className="lg:col-span-2 space-y-6">
                {/* About & Studio Overview */}
                <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    About Studio & Agency
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {studio.description || `${studio.studioName} is a verified professional photography agency providing commercial, portrait, and event media production.`}
                  </p>
                </Card>

                {/* Studio Location & Interactive Map Preview */}
                {(studio.city || studio.district || studio.baseLocation) && (
                  <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-rose-500" />
                        Studio Location & Coverage Map
                      </h3>
                      <span className="text-xs text-zinc-400 font-bold">
                        {[studio.city, studio.district].filter(Boolean).join(", ")}
                      </span>
                    </div>

                    <OSMMapPreview
                      location={studio.baseLocation}
                      city={studio.city}
                      district={studio.district}
                      locationMapLink={studio.locationMapLink}
                      height="240px"
                    />

                    {studio.locationMapLink && (
                      <div className="pt-1 flex justify-end">
                        <a
                          href={studio.locationMapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Open in Google Maps
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </Card>
                )}

                {/* STAFF PHOTOGRAPHERS & TEAM MEMBERS SECTION */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
                      Staff Photographers & Team Members ({studio.photographers.length})
                    </h3>
                  </div>

                  {studio.photographers.length === 0 ? (
                    <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl">
                      <p className="text-xs text-zinc-500">
                        No staff photographers are currently assigned to this studio team.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {studio.photographers.map((photographer) => (
                        <div
                          key={photographer.id}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest("button") || target.closest("a")) return;
                            router.push(`/photographers/${photographer.bookingSlug}`);
                          }}
                          className="cursor-pointer"
                        >
                          <PhotographerCard
                            photographer={{
                              ...photographer,
                              studioName: studio.studioName,
                              studioLogoUrl: studio.studioLogoUrl,
                              studioSlug: studio.studioSlug,
                            }}
                            onOpenRateModal={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Quick Booking Sidebar Card & Manager Info */}
              <div className="space-y-6">
                {/* Book Studio Sidebar Card */}
                <Card className="border border-indigo-200 dark:border-indigo-900/60 shadow-lg bg-gradient-to-b from-indigo-50/70 via-white to-white dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-900 rounded-3xl p-6 space-y-5">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <CalendarCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Book Studio Session
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Reserve studio space or hire team staff directly.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs bg-white dark:bg-zinc-800/80 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Network Status
                      </span>
                      <span className="font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active & Accepting Bookings
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700/50 pt-2.5">
                      <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-500" /> Booking Mode
                      </span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Instant Online</span>
                    </div>
                  </div>

                  {/* PROMINENT BOOK SESSION BUTTON */}
                  <Link href={bookingUrl} className="block w-full">
                    <Button className="w-full h-12 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-extrabold text-xs rounded-2xl shadow-md gap-2 cursor-pointer">
                      <CalendarCheck className="h-4 w-4" />
                      <span>Proceed to Book Studio</span>
                    </Button>
                  </Link>
                </Card>

                {/* Studio Management Card */}
                <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Studio Management & Staff
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500">Manager:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{studio.managerName}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500">Active Staff:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{studio.photographers.length} Staff Photographers</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-zinc-500">Plan Tier:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-[10px]">{studio.subscriptionPlan || "Verified Network"}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-12">
        © {new Date().getFullYear()} SeyaRoo Photography Platform. All rights reserved.
      </footer>
    </div>
  );
}
