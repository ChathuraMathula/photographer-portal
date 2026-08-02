"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setCredentials, UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, ShieldAlert, ArrowRight } from "lucide-react";

export default function CustomerCompleteProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }
    if (auth.isProfileCompleted) {
      router.push("/customer/dashboard");
    }
  }, [auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError("First Name, Last Name, and Phone Number are required.");
      return;
    }

    try {
      setLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/auth/customer/complete-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          address: address.trim() || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      const customer = data.customer;
      dispatch(
        setCredentials({
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          role: UserRole.CUSTOMER,
          isProfileCompleted: true,
        }),
      );

      router.push("/customer/dashboard");
    } catch (err: any) {
      setError(err.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0e2d5c]/10 dark:bg-blue-400/10 rounded-xl text-[#0e2d5c] dark:text-blue-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Complete Your Customer Profile
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Please fill in your contact information to finish setting up your portal access.
            </p>
          </div>
        </div>

        {/* Notice alert */}
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-900 dark:text-amber-300 text-xs">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span>
            Your profile details are used by photographers to manage your reservations and send quotes/invoices.
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                First Name *
              </Label>
              <Input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 rounded-lg text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Last Name *
              </Label>
              <Input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Phone Number *
            </Label>
            <Input
              type="tel"
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-lg text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Address / City (Optional)
            </Label>
            <Input
              type="text"
              placeholder="e.g. 123 Main Street, Colombo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 rounded-lg text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Saving Profile..." : "Complete Profile & View Dashboard"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </main>
  );
}
