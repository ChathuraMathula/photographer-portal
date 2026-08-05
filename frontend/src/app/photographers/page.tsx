"use client";

import React, { useState } from "react";
import { PhotographersHeader } from "./components/PhotographersHeader";
import { PhotographerCard } from "./components/PhotographerCard";
import { RatingModal } from "./components/RatingModal";
import { usePhotographers } from "./hooks/usePhotographers";
import { PhotographerProfileItem } from "./types";
import { Sparkles, Camera, Loader2, Search, SlidersHorizontal } from "lucide-react";

export default function PhotographersPage() {
  const {
    photographers,
    loading,
    loadingMore,
    hasMore,
    error,
    searchTerm,
    setSearchTerm,
    observerTargetRef,
    submitRating,
  } = usePhotographers();

  const [selectedPhotographer, setSelectedPhotographer] =
    useState<PhotographerProfileItem | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);

  const handleOpenRateModal = (photographer: PhotographerProfileItem) => {
    setSelectedPhotographer(photographer);
    setRateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation Header */}
      <PhotographersHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-950 via-[#0e2d5c] to-zinc-900 text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold border border-white/10 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Featured Talent Directory
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Find & Book Top Rated Photographers
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Browse verified professional photographers, check live availability, view authentic star ratings, and book your photography session instantly.
          </p>

          {/* Mobile Search Bar */}
          <div className="pt-4 max-w-md mx-auto sm:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search photographers..."
                className="w-full h-11 pl-9 pr-4 text-xs rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Results Info bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <Camera className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
            <span>
              Showing {photographers.length} photographer{photographers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time rating updates active</span>
          </div>
        </div>

        {/* Loading Initial state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 animate-pulse space-y-4"
              >
                <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-3xl max-w-md mx-auto space-y-3">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
              Unable to load photographers
            </h3>
            <p className="text-xs text-red-600 dark:text-red-500">{error}</p>
          </div>
        ) : photographers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              No photographers found
            </h3>
            <p className="text-xs text-zinc-500">
              {searchTerm
                ? `No search results matching "${searchTerm}". Try a different keyword.`
                : "There are currently no active photographers listed."}
            </p>
          </div>
        ) : (
          <>
            {/* Photographers Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photographers.map((photographer) => (
                <PhotographerCard
                  key={photographer.id}
                  photographer={photographer}
                  onOpenRateModal={handleOpenRateModal}
                />
              ))}
            </div>

            {/* Observer Trigger Target for Infinite Scroll */}
            <div
              ref={observerTargetRef}
              className="py-8 flex justify-center items-center min-h-[60px]"
            >
              {loadingMore && (
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0e2d5c] dark:text-blue-400" />
                  Loading more photographers...
                </div>
              )}
              {!hasMore && photographers.length > 0 && (
                <p className="text-xs text-zinc-400 font-medium">
                  You've reached the end of the photographers list.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* Star Rating Modal */}
      <RatingModal
        photographer={selectedPhotographer}
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        onSubmitRating={submitRating}
      />
    </div>
  );
}
