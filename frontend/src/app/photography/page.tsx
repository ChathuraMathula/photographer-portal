"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { PhotographersHeader } from "@/app/photographers/components/PhotographersHeader";
import { PhotographerCard } from "@/app/photographers/components/PhotographerCard";
import { RatingModal } from "@/app/photographers/components/RatingModal";
import { PhotographerProfileItem } from "@/app/photographers/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Camera,
  Building2,
  Users,
  Search,
  ShieldCheck,
  ChevronRight,
  CalendarCheck,
  Wifi,
} from "lucide-react";

export interface StudioItem {
  id: string;
  studioName: string;
  studioSlug: string;
  studioLogoUrl?: string;
  managerName: string;
  email: string;
  phone?: string;
  subscriptionPlan: string;
  photographerCount: number;
}

export default function UnifiedPhotographyPage() {
  const router = useRouter();
  const { socket, connected: socketConnected } = useSocket();

  const [activeTab, setActiveTab] = useState<"all" | "photographers" | "studios">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [photographers, setPhotographers] = useState<PhotographerProfileItem[]>([]);
  const [studios, setStudios] = useState<StudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPhotographer, setSelectedPhotographer] =
    useState<PhotographerProfileItem | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError("");
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";

      const [photogsRes, studiosRes] = await Promise.all([
        fetch(`${API}/photographers/public${query}`),
        fetch(`${API}/studios/public${query}`),
      ]);

      if (photogsRes.ok) {
        const pData = await photogsRes.json();
        setPhotographers(pData.data || []);
      }

      if (studiosRes.ok) {
        const sData = await studiosRes.json();
        setStudios(sData.data || []);
      }
    } catch (err: any) {
      setError("Failed to fetch photography providers.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time WebSocket Listeners for Live Directory Updates
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchData(true);
    };

    socket.on("userUpdated", handleRealtimeUpdate);
    socket.on("userRegistered", handleRealtimeUpdate);
    socket.on("userCreated", handleRealtimeUpdate);
    socket.on("photographerUpdated", handleRealtimeUpdate);
    socket.on("profileUpdated", handleRealtimeUpdate);

    return () => {
      socket.off("userUpdated", handleRealtimeUpdate);
      socket.off("userRegistered", handleRealtimeUpdate);
      socket.off("userCreated", handleRealtimeUpdate);
      socket.off("photographerUpdated", handleRealtimeUpdate);
      socket.off("profileUpdated", handleRealtimeUpdate);
    };
  }, [socket, fetchData]);

  const handleOpenRateModal = (photographer: PhotographerProfileItem) => {
    setSelectedPhotographer(photographer);
    setRateModalOpen(true);
  };

  const submitRating = async (profileId: string, rating: number) => {
    if (!selectedPhotographer) return;
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    await fetch(`${API}/photographers/public/${selectedPhotographer.bookingSlug}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col animate-in fade-in duration-300">
      {/* Top Header */}
      <PhotographersHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-950 via-[#0e2d5c] to-zinc-900 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold border border-white/10 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Verified Talent & Studio Network
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Find & Book Top Photographers & Studios
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Discover verified solo photographers, creative agencies, and production studios. Compare portfolios, check real-time availability, and book instantly.
          </p>

          {/* Search bar */}
          <div className="pt-4 max-w-md mx-auto sm:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search talent or studios..."
                className="w-full h-11 pl-9 pr-4 text-xs rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-[#0e2d5c] text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              All Providers ({photographers.length + studios.length})
            </button>

            <button
              onClick={() => setActiveTab("photographers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "photographers"
                  ? "bg-[#0e2d5c] text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              Photographers ({photographers.length})
            </button>

            <button
              onClick={() => setActiveTab("studios")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "studios"
                  ? "bg-[#0e2d5c] text-white shadow-md"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Studios ({studios.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-900/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {socketConnected ? "Live Real-Time Sync Active" : "Instant Booking Active"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse space-y-4"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-3xl max-w-md mx-auto space-y-3">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
              Unable to load photography listings
            </h3>
            <p className="text-xs text-red-600 dark:text-red-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Solo Photographers Section */}
            {(activeTab === "all" || activeTab === "photographers") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
                    Independent Photographers ({photographers.length})
                  </h2>
                </div>

                {photographers.length === 0 ? (
                  <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl">
                    <p className="text-xs text-zinc-500">No photographers match your search query.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photographers.map((photographer) => (
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
                          photographer={photographer}
                          onOpenRateModal={handleOpenRateModal}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Photography Studios Section */}
            {(activeTab === "all" || activeTab === "studios") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Verified Studios & Agencies ({studios.length})
                  </h2>
                </div>

                {studios.length === 0 ? (
                  <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl">
                    <p className="text-xs text-zinc-500">No studios match your search query.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studios.map((studio) => (
                      <div
                        key={studio.id}
                        onClick={() => router.push(`/studios/${studio.studioSlug}`)}
                        className="cursor-pointer group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                      >
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {studio.studioLogoUrl ? (
                                <img
                                  src={studio.studioLogoUrl}
                                  alt={studio.studioName}
                                  className="h-14 w-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100 shrink-0"
                                />
                              ) : (
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                                  {studio.studioName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {studio.studioName}
                                </h3>
                                <p className="text-xs text-zinc-400 font-medium">
                                  Managed by {studio.managerName}
                                </p>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3 text-indigo-500" />
                              Studio
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Users className="h-3.5 w-3.5 text-indigo-500" />
                            <span>
                              <strong className="text-zinc-800 dark:text-zinc-200">
                                {studio.photographerCount}
                              </strong>{" "}
                              Team Members registered
                            </span>
                          </div>
                        </CardContent>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-800/80 flex items-center justify-between">
                          <Link
                            href={`/studios/${studio.studioSlug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            View Studio Profile & Team
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>

                          <Link
                            href={`/book/${studio.studioSlug}`}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <CalendarCheck className="h-3.5 w-3.5" />
                            Book Studio
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rating Modal */}
      <RatingModal
        photographer={selectedPhotographer}
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        onSubmitRating={submitRating}
      />
    </div>
  );
}
