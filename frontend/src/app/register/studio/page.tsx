"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterStudioPage() {
  const [formData, setFormData] = useState({
    studioName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.studioName ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/auth/register/studio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Studio registration failed.");
      }

      setSubmitted(true);
      toast.success("Studio account registered successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during studio registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/80 px-4 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/photographers" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0e2d5c] to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
              Seya<span className="text-blue-600 dark:text-blue-400">Roo</span>
            </span>
          </Link>

          <Link
            href="/photographers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Showcase
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 my-6">
        {submitted ? (
          <Card className="border border-indigo-200 dark:border-indigo-900/60 shadow-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 sm:p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                Studio Application Under Review
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                Thank you for registering <strong>{formData.studioName}</strong> on SeyaRoo!
                Your studio account application has been submitted and is currently undergoing review by our management team.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Studio Activation Information</span>
              </div>
              <ul className="list-disc list-inside text-zinc-500 space-y-1 text-[11px]">
                <li>Super admins will verify your studio organization and contact details.</li>
                <li>Your studio starts on our <strong>Free Tier</strong> (up to 5 team photographers).</li>
                <li>Once approved, log into your studio dashboard via the <strong>Studio & Admin Portal</strong>.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/photographers">
                <Button className="w-full sm:w-auto h-10 px-6 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs rounded-xl cursor-pointer">
                  Return to Showcase
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline" className="w-full sm:w-auto h-10 px-6 font-bold text-xs rounded-xl cursor-pointer">
                  Studio & Admin Login
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border border-zinc-200/60 dark:border-zinc-800/80 shadow-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 via-blue-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent border-b border-zinc-150 dark:border-zinc-800 pb-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-indigo-600" />
                  Studio Organization
                </span>
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Multi-Photographer Management
                </span>
              </div>
              <CardTitle className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                Register a Photography Studio
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Register your studio business on SeyaRoo to manage multiple photographers, studio bookings, and team package offerings.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                {/* Studio Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Studio / Business Name *
                  </Label>
                  <Input
                    required
                    placeholder="e.g. Apex Visuals Studio"
                    value={formData.studioName}
                    onChange={(e) =>
                      setFormData({ ...formData, studioName: e.target.value })
                    }
                    className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                  />
                </div>

                {/* Manager Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Manager First Name *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Ruwan"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Manager Last Name *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Fernando"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Studio Official Email *
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="contact@apexvisuals.lk"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Create Studio Password *
                    </Label>
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                {/* Phone & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Studio Contact Phone
                    </Label>
                    <Input
                      placeholder="011 234 5678"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Primary City
                    </Label>
                    <Input
                      placeholder="e.g. Colombo 03"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                {/* Studio Physical Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Studio Physical Address
                  </Label>
                  <Input
                    placeholder="No. 123, Galle Road, Colombo 03"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </CardContent>

              <CardFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  Free Tier (Up to 5 photographers)
                </span>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                >
                  {loading ? "Submitting Studio..." : "Register Studio Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50">
        © {new Date().getFullYear()} SeyaRoo Photography Platform. All rights reserved.
      </footer>
    </div>
  );
}
