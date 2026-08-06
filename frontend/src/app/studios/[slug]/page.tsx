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
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${API}/studios/public/${slug}`);
        if (!res.ok) {
          throw new Error("Studio not found");
        }
        const data = await res.json();
        setStudio(data);
      } catch (err: any) {
        setError(err.message || "Failed to load studio details");
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <PhotographersHeader searchTerm="" onSearchChange={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
                Studio Not Found
              </h3>
              <p className="text-xs text-zinc-500">
                The requested studio profile could not be found or is inactive.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* SOCIAL MEDIA HERO STUDIO CARD */}
            <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              {/* Cover Banner */}
              <div className="h-48 sm:h-60 w-full bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-purple-950 relative p-4 sm:p-6 flex items-start justify-between">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-inner flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Verified Studio Network
                  </span>
                </div>

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

              {/* Avatar Logo & Header Bar */}
              <div className="px-6 sm:px-8 pb-6 pt-0 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          Verified Agency
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">
                        Managed by <strong>{studio.managerName}</strong> • {studio.photographers.length} Team Members
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-zinc-500 pt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-indigo-500" /> {studio.email}</span>
                        {studio.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-indigo-500" /> {studio.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* BOOK STUDIO SESSION CTA BUTTON */}
                  <div className="shrink-0 self-center md:self-end">
                    <Link href={bookingUrl}>
                      <Button className="h-12 px-7 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all gap-2 cursor-pointer">
                        <CalendarCheck className="h-4.5 w-4.5" />
                        <span>Book Studio Session</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Section */}
            {(studio.city || studio.district || studio.baseLocation) && (
              <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  Studio Location & Map
                </h3>
                <OSMMapPreview
                  location={studio.baseLocation}
                  city={studio.city}
                  district={studio.district}
                  locationMapLink={studio.locationMapLink}
                  height="220px"
                />
              </Card>
            )}

            {/* Studio Photographers Team Grid */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
                  Studio Team Photographers ({studio.photographers.length})
                </h2>
              </div>

              {studio.photographers.length === 0 ? (
                <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl">
                  <p className="text-xs text-zinc-500">
                    No photographers are currently assigned to this studio team.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-12">
        © {new Date().getFullYear()} SeyaRoo Photography Platform. All rights reserved.
      </footer>
    </div>
  );
}
