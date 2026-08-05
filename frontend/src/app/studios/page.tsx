"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PhotographersHeader } from "@/app/photographers/components/PhotographersHeader";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  MapPin,
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

export default function StudiosShowcasePage() {
  const [studios, setStudios] = useState<StudioItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        const res = await fetch(`${API}/studios/public${query}`);
        if (res.ok) {
          const result = await res.json();
          setStudios(result.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch studios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudios();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <PhotographersHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#0e2d5c] via-indigo-900 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-blue-200 border border-white/20 backdrop-blur-md inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              SeyaRoo Studio Network
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Explore Professional Photography Studios
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Discover top-rated photography studios, agency teams, and multi-photographer organizations across Sri Lanka.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/photographers"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              Browse Solo Photographers
            </Link>
            <Link
              href="/register/studio"
              className="px-4 py-2 rounded-xl bg-white text-[#0e2d5c] hover:bg-blue-50 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Register Your Studio
            </Link>
          </div>
        </div>

        {/* Studios Showcase Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              All Verified Studios ({studios.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-44 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : studios.length === 0 ? (
            <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl">
              <div className="max-w-sm mx-auto space-y-3">
                <Building2 className="h-10 w-10 text-zinc-400 mx-auto" />
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No Studios Found
                </h3>
                <p className="text-xs text-zinc-500">
                  {searchTerm
                    ? `No studios match "${searchTerm}".`
                    : "No studio accounts have registered yet."}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {studios.map((studio) => (
                <Card
                  key={studio.id}
                  className="border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs bg-white dark:bg-zinc-900 transition-all rounded-2xl overflow-hidden group flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {studio.studioLogoUrl ? (
                          <img
                            src={studio.studioLogoUrl}
                            alt={studio.studioName}
                            className="h-12 w-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100 shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
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

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                        Studio
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
                      <span className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-150 dark:border-zinc-800">
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          {studio.photographerCount}
                        </strong>{" "}
                        Photographers
                      </span>
                    </div>
                  </CardContent>

                  <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Verified Studio Partner
                    </span>
                    <Link
                      href={`/studios/${studio.studioSlug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Studio & Team
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-12">
        © {new Date().getFullYear()} SeyaRoo Platform. All rights reserved.
      </footer>
    </div>
  );
}
