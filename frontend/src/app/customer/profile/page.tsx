"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setCredentials, UserRole } from "@/store/slices/authSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CheckCircle2, Mail, Phone, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/auth/customer/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email || auth.email || "");
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setIsCompleted(Boolean(data.isProfileCompleted));
        }
      } catch (err) {
        console.error("Failed to load customer profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API, auth.email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error("First Name, Last Name, and Phone Number are required.");
      return;
    }

    try {
      setSaving(true);
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
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

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

      setIsCompleted(true);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header Card */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0e2d5c]/10 text-[#0e2d5c] dark:bg-blue-400/10 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                {firstName ? firstName[0].toUpperCase() : "C"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {firstName ? `${firstName} ${lastName}` : "Customer Profile"}
                  </h1>
                  {isCompleted && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Profile Complete
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
            Personal Details
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Keep your contact information up to date so photographers can reach you regarding bookings and quotes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Loading profile details...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    First Name *
                  </Label>
                  <Input
                    type="text"
                    placeholder="First Name"
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
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    Email Address (Read-only)
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 opacity-70"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
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
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
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

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-6 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Profile Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
