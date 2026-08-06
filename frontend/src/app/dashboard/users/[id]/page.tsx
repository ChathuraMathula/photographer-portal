"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { useSocket } from "@/context/SocketContext";
import { OSMMapPreview } from "@/components/maps/OSMMapPreview";
import { EditUserDetailsModal } from "@/components/modals/EditUserDetailsModal";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Ban,
  Users,
  ShieldCheck,
  Edit2,
  Copy,
  Check,
  Globe,
  RefreshCw,
  Sparkles,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { type UserAccount } from "@/types";

interface StudioStaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  role?: string;
  isActive: boolean;
  bookingSlug?: string;
}

export default function UserRequestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || "";

  const { role: loggedInRole, id: loggedInUserId } = useSelector((state: RootState) => state.auth);
  const { socket, connected: socketConnected } = useSocket();

  const [user, setUser] = useState<UserAccount | null>(null);
  const [studioStaff, setStudioStaff] = useState<StudioStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [showEditSlugModal, setShowEditSlugModal] = useState(false);

  const fetchUserDetails = useCallback(async (isSilent = false) => {
    if (!userId) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/users/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load user details");
      }

      setUser(data);

      // If user is a Studio, fetch their registered team staff members
      if (data.role === UserRole.STUDIO) {
        try {
          const studioRes = await fetch(`${API}/studios/${data.studioSlug || data.id}`, {
            credentials: "include",
          });
          if (studioRes.ok) {
            const studioData = await studioRes.json();
            setStudioStaff(studioData.photographers || []);
          }
        } catch (staffErr) {
          console.error("Failed to load studio staff members:", staffErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong loading user details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Real-time WebSocket Listeners for Live Updates
  useEffect(() => {
    if (!socket || !userId) return;

    // Join room for this specific user if possible
    socket.emit("joinUserRoom", { userId });

    const handleUserUpdate = (data: any) => {
      if (data?.userId === userId || data?.id === userId) {
        toast.info("User details updated in real time");
        fetchUserDetails(true);
      }
    };

    socket.on("userUpdated", handleUserUpdate);
    socket.on("photographerUpdated", handleUserUpdate);
    socket.on("profileUpdated", handleUserUpdate);

    return () => {
      socket.off("userUpdated", handleUserUpdate);
      socket.off("photographerUpdated", handleUserUpdate);
      socket.off("profileUpdated", handleUserUpdate);
    };
  }, [socket, userId, fetchUserDetails]);

  const handleToggleActive = async () => {
    if (!user) return;
    if (user.id === loggedInUserId) {
      toast.error("You cannot suspend or deactivate your own account.");
      return;
    }

    try {
      setActionLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/users/${user.id}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update account status");
      }

      setUser((prev) => (prev ? { ...prev, isActive: data.isActive } : null));

      if (data.isActive) {
        toast.success(`Account for ${user.firstName} has been approved & activated!`);
      } else {
        toast.info(`Account for ${user.firstName} has been suspended.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating account status");
    } finally {
      setActionLoading(false);
    }
  };

  const currentSlug =
    user?.role === UserRole.STUDIO
      ? user?.studioSlug || ""
      : user?.profile?.bookingSlug || "";

  const fullBookingUrl = currentSlug
    ? user?.role === UserRole.STUDIO
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/studios/${currentSlug}`
      : `${typeof window !== "undefined" ? window.location.origin : ""}/book/${currentSlug}`
    : "";

  const handleCopySlug = () => {
    if (!fullBookingUrl) return;
    navigator.clipboard.writeText(fullBookingUrl);
    setCopiedSlug(true);
    toast.success("Booking URL copied to clipboard!");
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  if (
    loggedInRole !== UserRole.SUPER_ADMIN &&
    loggedInRole !== UserRole.ADMIN
  ) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Access Denied. Authorized administrators only.
      </div>
    );
  }

  const isSelf = user?.id === loggedInUserId;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Navigation & Realtime Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
              socketConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <Wifi className="h-3 w-3" />
            {socketConnected ? "Real-time Live Sync Active" : "Offline Sync"}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchUserDetails(true)}
            disabled={refreshing}
            className="h-8 text-xs font-semibold rounded-xl border-zinc-200 dark:border-zinc-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      ) : error || !user ? (
        <Card className="p-8 text-center border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-red-500 font-medium">{error || "User account not found."}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Status Header Card */}
          <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-zinc-50 via-zinc-100/50 to-transparent dark:from-zinc-950 dark:via-zinc-900 border-b border-zinc-150 dark:border-zinc-800 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-[#0e2d5c] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                    {user.role === UserRole.STUDIO ? (
                      <Building2 className="h-7 w-7 text-indigo-300" />
                    ) : user.role === UserRole.PHOTOGRAPHER ? (
                      <Camera className="h-7 w-7 text-blue-300" />
                    ) : (
                      <UserIcon className="h-7 w-7 text-purple-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
                        {user.studioName || `${user.firstName} ${user.lastName}`}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                        {user.role}
                      </span>
                      {isSelf && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                          YOU (ACTIVE SESSION)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {user.email} • Registered on {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      user.isActive
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        user.isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    {user.isActive ? "Active Account" : "Pending Review"}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* BOOKING SLUG & SHOWCASE CARD (NEW / MOVED HERE) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-transparent dark:from-indigo-950/40 dark:via-blue-950/20 border border-indigo-150 dark:border-indigo-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/30 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      {user.role === UserRole.STUDIO ? "Studio Showcase & Booking Link" : "Photographer Booking Slug & Showcase"}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Public booking slug used by clients to submit reservations directly.
                    </p>
                  </div>

                  {loggedInRole === UserRole.SUPER_ADMIN && (
                    <Button
                      type="button"
                      onClick={() => setShowEditSlugModal(true)}
                      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Booking Slug
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Slug Key:</span>
                      <code className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200/60 dark:border-indigo-800">
                        {currentSlug || "No slug configured"}
                      </code>
                    </div>

                    {fullBookingUrl && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-500 font-medium">Public URL:</span>
                        <a
                          href={user.role === UserRole.STUDIO ? `/studios/${currentSlug}` : `/book/${currentSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 truncate max-w-md"
                        >
                          {fullBookingUrl}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>

                  {currentSlug && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopySlug}
                        className="h-9 text-xs font-bold rounded-xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                      >
                        {copiedSlug ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                            Copy Link
                          </>
                        )}
                      </Button>

                      <a
                        href={user.role === UserRole.STUDIO ? `/studios/${currentSlug}` : `/book/${currentSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Open Preview
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* GRID: Account Details & Role Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account & Contact Info */}
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Contact & Account Information
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <UserIcon className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span><strong>Full Name:</strong> {user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span><strong>Email:</strong> {user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span><strong>Phone:</strong> {user.phone || "Not provided"}</span>
                    </div>
                    {user.username && (
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span><strong>Username:</strong> <code className="font-mono text-indigo-600 font-bold">@{user.username}</code></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Specific Details */}
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {user.role === UserRole.STUDIO ? "Studio Configuration & Capacity" : "Photographer Showcase Details"}
                  </h3>

                  {user.role === UserRole.STUDIO ? (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Studio Name:</strong> {user.studioName || `${user.firstName}'s Studio`}
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Subscription Plan:</strong>{" "}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                          {user.subscriptionPlan || "FREE"}
                        </span>
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Max Team Capacity:</strong> {user.maxPhotographers || 5} photographers
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Registered Staff Members:</strong> {studioStaff.length} active members
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      {user.profile?.specializations && (
                        <div className="space-y-1">
                          <span className="text-zinc-500 font-medium block">Specializations:</span>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(user.profile.specializations)
                              ? user.profile.specializations
                              : (user.profile.specializations as string).split(",")
                            ).map((spec, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                {spec.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {user.profile?.offlineMessage && (
                        <p className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                          <strong>Offline Note:</strong> {user.profile.offlineMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* LOCATION DETAILS & INTERACTIVE MAP PREVIEW (NEW & FEATURED) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-rose-500" />
                    Location Details & Interactive Map Preview
                  </h3>
                  <span className="text-xs text-zinc-400 font-medium">
                    {[user.profile?.city, user.profile?.district].filter(Boolean).join(", ") || "Base City / District"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Location Meta Card */}
                  <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-400 font-bold block text-[10px] uppercase tracking-wider">Base Location Address</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                        {user.profile?.baseLocation || "No address specified"}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-400 font-bold block text-[10px] uppercase tracking-wider">City</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                        {user.profile?.city || "Not provided"}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-400 font-bold block text-[10px] uppercase tracking-wider">District</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                        {user.profile?.district || "Not provided"}
                      </span>
                    </div>

                    {user.profile?.locationMapLink && (
                      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                        <a
                          href={user.profile.locationMapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Open Google Maps Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Location Interactive Map Preview */}
                  <div className="md:col-span-2">
                    <OSMMapPreview
                      location={user.profile?.baseLocation}
                      city={user.profile?.city}
                      district={user.profile?.district}
                      locationMapLink={user.profile?.locationMapLink}
                      height="260px"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {user.profile?.bio && (
                <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Profile Bio & Description
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {user.profile.bio}
                  </p>
                </div>
              )}

              {/* Studio Registered Team Staff Section */}
              {user.role === UserRole.STUDIO && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
                    Studio Team Photographers & Staff ({studioStaff.length})
                  </h3>

                  {studioStaff.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-400 text-center border border-zinc-200/60 dark:border-zinc-800">
                      No team staff members registered under this studio account yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studioStaff.map((staff) => (
                        <div
                          key={staff.id}
                          className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {staff.firstName} {staff.lastName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              {staff.role === "STUDIO_STAFF" ? "Staff" : "Photographer"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate">{staff.email}</p>
                          {staff.phone && (
                            <p className="text-[11px] text-zinc-400">{staff.phone}</p>
                          )}
                          {staff.bookingSlug && (
                            <div className="pt-1">
                              <Link
                                href={`/book/${staff.bookingSlug}`}
                                target="_blank"
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                Slug: {staff.bookingSlug}
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions Footer */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs text-zinc-400">
                  {isSelf
                    ? "Logged in Super Admin account (self protection active)"
                    : user.isActive
                    ? "Account is active on SeyaRoo"
                    : "Review application details before approving"}
                </span>

                <div className="flex items-center gap-2">
                  {!user.isActive ? (
                    <Button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleToggleActive}
                      className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      {actionLoading ? "Activating..." : "Approve & Activate Account"}
                    </Button>
                  ) : isSelf ? (
                    <Button
                      type="button"
                      disabled
                      className="h-10 px-5 bg-zinc-100 text-zinc-400 dark:bg-zinc-800 font-bold text-xs rounded-xl cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                    >
                      <ShieldCheck className="h-4 w-4 mr-1.5 text-emerald-500" />
                      Self Account Protected
                    </Button>
                  ) : (
                    loggedInRole === UserRole.SUPER_ADMIN && (
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={actionLoading}
                        onClick={handleToggleActive}
                        className="h-10 px-6 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        <Ban className="h-4 w-4 mr-1.5" />
                        {actionLoading ? "Suspending..." : "Suspend Account"}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Booking Slug & User Details Modal */}
      {showEditSlugModal && user && (
        <EditUserDetailsModal
          user={user}
          onClose={() => setShowEditSlugModal(false)}
          onSuccess={(updatedUser) => {
            setUser((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                studioSlug:
                  prev.role === UserRole.STUDIO
                    ? updatedUser.bookingSlug || prev.studioSlug
                    : prev.studioSlug,
                profile: prev.profile
                  ? {
                      ...prev.profile,
                      bookingSlug:
                        updatedUser.bookingSlug || prev.profile.bookingSlug,
                    }
                  : prev.profile,
              };
            });
            setShowEditSlugModal(false);
            fetchUserDetails(true);
          }}
        />
      )}
    </div>
  );
}
