"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PhotographersHeader } from "@/app/photographers/components/PhotographersHeader";
import { PhotographerCard } from "@/app/photographers/components/PhotographerCard";
import { PhotographerProfileItem } from "@/app/photographers/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

interface StudioDetail {
  id: string;
  studioName: string;
  studioSlug: string;
  studioLogoUrl?: string;
  managerName: string;
  email: string;
  phone?: string;
  subscriptionPlan: string;
  photographers: PhotographerProfileItem[];
}

export default function StudioDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [studio, setStudio] = useState<StudioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <PhotographersHeader searchTerm="" onSearchChange={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/studios"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Studios
          </Link>
        </div>

        {loading ? (
          <div className="h-64 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        ) : error || !studio ? (
          <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl">
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
          <>
            {/* Studio Hero Header Card */}
            <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-blue-900 p-6 sm:p-8 text-white relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    {studio.studioLogoUrl ? (
                      <img
                        src={studio.studioLogoUrl}
                        alt={studio.studioName}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg bg-zinc-100 shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
                        {studio.studioName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                          {studio.studioName}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          Verified Studio
                        </span>
                      </div>
                      <p className="text-xs text-blue-200/80 font-medium">
                        Managed by {studio.managerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-blue-300" />
                      <span>{studio.email}</span>
                    </div>
                    {studio.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-blue-300" />
                        <span>{studio.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Studio Photographers Team Grid */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
                  Studio Team Photographers ({studio.photographers.length})
                </h2>
              </div>

              {studio.photographers.length === 0 ? (
                <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl">
                  <p className="text-xs text-zinc-500">
                    No photographers are currently assigned to this studio.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studio.photographers.map((photographer) => (
                    <PhotographerCard
                      key={photographer.id}
                      photographer={{
                        ...photographer,
                        studioName: studio.studioName,
                        studioLogoUrl: studio.studioLogoUrl,
                        studioSlug: studio.studioSlug,
                      }}
                      onOpenRateModal={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-12">
        © {new Date().getFullYear()} SeyaRoo Platform. All rights reserved.
      </footer>
    </div>
  );
}
