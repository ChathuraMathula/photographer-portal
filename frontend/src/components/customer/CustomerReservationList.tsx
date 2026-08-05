"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Search,
  ExternalLink,
  Camera,
  Filter,
  ArrowUpDown,
  FileText,
} from "lucide-react";

export interface CustomerReservationItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location: string;
  city?: string;
  district?: string;
  status: string;
  reservationToken: string;
  totalAmountInCents?: number;
  photographer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
}

interface CustomerReservationListProps {
  reservations: CustomerReservationItem[];
  loading: boolean;
}

export function CustomerReservationList({
  reservations,
  loading,
}: CustomerReservationListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");

  // Filter & Sort reservations
  const filteredReservations = useMemo(() => {
    return reservations
      .filter((res) => {
        // Status filter
        if (statusFilter !== "ALL" && res.status !== statusFilter) {
          return false;
        }

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const photographerName = res.photographer
            ? `${res.photographer.firstName} ${res.photographer.lastName}`.toLowerCase()
            : "";
          const eventType = (res.eventType || "").toLowerCase();
          const location = (res.location || "").toLowerCase();
          const city = (res.city || "").toLowerCase();

          return (
            photographerName.includes(q) ||
            eventType.includes(q) ||
            location.includes(q) ||
            city.includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "NEWEST" ? dateB - dateA : dateA - dateB;
      });
  }, [reservations, search, statusFilter, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300";
      case "PROPOSED":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300";
      case "REJECTED":
        return "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300";
      case "CANCELLED":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar (Photographer List Style) */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search by photographer or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
          />
        </div>

        {/* Status Filter Tabs & Sort Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
            {["ALL", "CONFIRMED", "PROPOSED", "PENDING", "CANCELLED"].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setSortOrder((prev) => (prev === "NEWEST" ? "OLDEST" : "NEWEST"))
            }
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <span>{sortOrder === "NEWEST" ? "Newest First" : "Oldest First"}</span>
          </button>
        </div>
      </div>

      {/* Reservations List Body */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          Loading your reservations list...
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-10 text-center bg-white dark:bg-zinc-900 rounded-2xl">
          <div className="max-w-sm mx-auto space-y-3">
            <FileText className="h-10 w-10 text-zinc-400 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No Reservations Found
            </h3>
            <p className="text-xs text-zinc-500">
              {search || statusFilter !== "ALL"
                ? "No bookings match your selected filter criteria."
                : "You haven't placed any photography booking requests yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((res) => {
            const photographerName = res.photographer
              ? `${res.photographer.firstName} ${res.photographer.lastName}`
              : "Photographer";

            const initials = res.photographer
              ? `${res.photographer.firstName?.charAt(0) || ""}${res.photographer.lastName?.charAt(0) || ""}`.toUpperCase()
              : "P";

            return (
              <Card
                key={res.id}
                className="border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-xs bg-white dark:bg-zinc-900 transition-all rounded-2xl overflow-hidden group"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Photographer & Event details */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Photographer Avatar */}
                    {res.photographer?.profileImageUrl ? (
                      <img
                        src={res.photographer.profileImageUrl}
                        alt={photographerName}
                        className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#0e2d5c] to-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-inner">
                        {initials}
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {photographerName}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          {res.eventType}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(res.status)}`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {new Date(res.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          {res.startTime} - {res.endTime}
                        </span>
                        {(res.city || res.location) && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{res.city || res.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 justify-end">
                    <Link
                      href={`/customer/reservations/${res.id}`}
                      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      View Session & Chat
                    </Link>

                    <Link
                      href={`/book/track/${res.reservationToken}`}
                      target="_blank"
                      title="Open Tracking Page"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
