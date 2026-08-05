"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ExternalLink,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { type UserAccount } from "@/types";

export default function UserRequestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || "";

  const { role: loggedInRole } = useSelector((state: RootState) => state.auth);

  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${API}/users/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load user details");
        }

        setUser(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong loading request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleToggleActive = async () => {
    if (!user) return;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </Link>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      ) : error || !user ? (
        <Card className="p-8 text-center border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-red-500 font-medium">{error || "User request not found."}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Status Header Card */}
          <Card className="border border-zinc-200/70 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-zinc-50 via-zinc-100/50 to-transparent dark:from-zinc-950 dark:via-zinc-900 border-b border-zinc-150 dark:border-zinc-800 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#0e2d5c] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                    {user.role === UserRole.STUDIO ? (
                      <Building2 className="h-6 w-6 text-indigo-300" />
                    ) : user.role === UserRole.PHOTOGRAPHER ? (
                      <Camera className="h-6 w-6 text-blue-300" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-purple-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-black text-zinc-900 dark:text-white">
                        {user.studioName || `${user.firstName} ${user.lastName}`}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email} • Requested on {new Date(user.createdAt || Date.now()).toLocaleDateString()}
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
              {/* Profile / Studio Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account & Contact Info */}
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Contact & Manager Information
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                      <span><strong>Manager Name:</strong> {user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      <span><strong>Email:</strong> {user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Phone className="h-4 w-4 text-zinc-400" />
                      <span><strong>Phone:</strong> {user.phone || "Not provided"}</span>
                    </div>
                    {user.profile?.city && (
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <span><strong>Base City:</strong> {user.profile.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Specific Details */}
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {user.role === UserRole.STUDIO ? "Studio Plan & Capacity" : "Photographer Profile"}
                  </h3>

                  {user.role === UserRole.STUDIO ? (
                    <div className="space-y-2.5 text-xs">
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Studio Name:</strong> {user.studioName || "N/A"}
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Subscription Plan:</strong>{" "}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                          {user.subscriptionPlan || "FREE"}
                        </span>
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>Max Photographers Limit:</strong> {user.maxPhotographers || 5}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {user.profile?.bookingSlug && (
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-zinc-500 font-medium">Booking Slug:</span>
                          <Link
                            href={`/book/${user.profile.bookingSlug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                          >
                            {user.profile.bookingSlug}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}

                      {user.profile?.specializations && user.profile.specializations.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-zinc-500 font-medium block">Specializations:</span>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(user.profile.specializations)
                              ? user.profile.specializations
                              : (user.profile.specializations as string).split(",")
                            ).map((spec, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                {spec.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              {user.profile?.bio && (
                <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Applicant Bio & Style Description
                  </h3>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {user.profile.bio}
                  </p>
                </div>
              )}

              {/* Review Actions Footer */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {user.isActive ? "Account is active on SeyaRoo" : "Review application details before approving"}
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
    </div>
  );
}
