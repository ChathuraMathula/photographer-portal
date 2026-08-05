"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";
import {
  CustomerReservationList,
  type CustomerReservationItem,
} from "@/components/customer/CustomerReservationList";

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
  const [reservations, setReservations] = useState<CustomerReservationItem[]>([]);
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
          </div>
        </CardContent>
      </Card>

      {/* Customer Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
            My Bookings & Sessions ({reservations.length})
          </h2>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-red-50 text-xs text-red-600 font-medium">
            {error}
          </div>
        ) : (
          <CustomerReservationList
            reservations={reservations}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
