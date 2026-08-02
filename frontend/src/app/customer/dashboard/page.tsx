"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface CustomerReservation {
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
  };
}

interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  isProfileCompleted: boolean;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

        // Fetch Profile
        const profRes = await fetch(`${API}/auth/customer/me`, {
          credentials: "include",
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
          if (!profData.isProfileCompleted) {
            router.push("/customer/complete-profile");
            return;
          }
        }

        // Fetch Reservations
        const resRes = await fetch(`${API}/customer/reservations`, {
          credentials: "include",
        });
        if (resRes.ok) {
          const resData = await resRes.json();
          setReservations(resData || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load customer dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300";
      case "PROPOSED":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300";
      case "CANCELLED":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Profile Summary Card */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Welcome back, {profile?.firstName || auth.firstName || "Customer"}!
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Profile Complete
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Track your booked photography sessions, check proposals, and communicate live with photographers.
              </p>
            </div>

            {profile && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Reservations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
            My Bookings & Sessions ({reservations.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Loading your reservations...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-xs text-red-600 font-medium">
            {error}
          </div>
        ) : reservations.length === 0 ? (
          <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900">
            <div className="max-w-sm mx-auto space-y-3">
              <FileText className="h-10 w-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No Reservations Yet
              </h3>
              <p className="text-xs text-zinc-500">
                You haven't placed any photography booking requests using this email address yet.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.map((res) => (
              <Card
                key={res.id}
                className="border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs bg-white dark:bg-zinc-900 transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      {res.eventType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(res.status)}`}
                    >
                      {res.status}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-zinc-500 mt-1">
                    Booked on {new Date(res.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-150 dark:border-zinc-850">
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{res.startTime} - {res.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 truncate">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{res.city || res.location || "On Location"}</span>
                    </div>
                  </div>

                  {res.photographer && (
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-150 dark:border-zinc-800">
                      <span className="text-zinc-500 font-medium">Photographer:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {res.photographer.firstName} {res.photographer.lastName}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/customer/reservations/${res.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      View Session & Live Chat
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
