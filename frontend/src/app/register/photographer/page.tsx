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
  Camera,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  MapPin,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const SPECIALIZATION_OPTIONS = [
  "Wedding",
  "Portrait",
  "Event",
  "Fashion",
  "Commercial",
  "Landscape",
  "Street",
];

export default function RegisterPhotographerWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    bio: "",
    specializations: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error("Please fill in all required account fields.");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/auth/register/photographer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSubmitted(true);
      toast.success("Photographer registration submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Top Navigation */}
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
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 my-4">
        {submitted ? (
          <Card className="border border-emerald-200 dark:border-emerald-900/60 shadow-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 sm:p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                Application Under Review
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                Thank you for applying to join SeyaRoo as an independent photographer!
                Your profile has been submitted and is currently undergoing verification by our administration team.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Next Steps for Account Activation</span>
              </div>
              <ul className="list-disc list-inside text-zinc-500 space-y-1 text-[11px]">
                <li>Super admins will review your details and contact number.</li>
                <li>Once approved, your account will be activated and visible on the SeyaRoo showcase.</li>
                <li>You will then be able to log in via <strong>Photographer Login</strong>.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/photographers">
                <Button className="w-full sm:w-auto h-10 px-6 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs rounded-xl cursor-pointer">
                  Return to Showcase
                </Button>
              </Link>
              <Link href="/photographer/login">
                <Button variant="outline" className="w-full sm:w-auto h-10 px-6 font-bold text-xs rounded-xl cursor-pointer">
                  Go to Photographer Login
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="border border-zinc-200/60 dark:border-zinc-800/80 shadow-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
            {/* Wizard Progress Bar */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border-b border-zinc-200/60 dark:border-zinc-800">
              <div className="flex items-center justify-between max-w-sm mx-auto">
                {[
                  { step: 1, label: "Account" },
                  { step: 2, label: "Profile" },
                  { step: 3, label: "Specialties" },
                ].map((s, idx) => (
                  <React.Fragment key={s.step}>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          currentStep === s.step
                            ? "bg-[#0e2d5c] text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-sm"
                            : currentStep > s.step
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {currentStep > s.step ? <Check className="h-4 w-4" /> : s.step}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          currentStep === s.step
                            ? "text-[#0e2d5c] dark:text-blue-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                          currentStep > s.step ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <CardHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="h-3 w-3 text-blue-600" />
                  Solo Photographer Registration
                </span>
                <span className="text-[10px] font-bold text-zinc-400">Step {currentStep} of 3</span>
              </div>
              <CardTitle className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                {currentStep === 1 && "Create Your Photographer Credentials"}
                {currentStep === 2 && "Location & Portfolio Information"}
                {currentStep === 3 && "Specializations & Review Application"}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                {currentStep === 1 && "Enter your basic contact details and account login password."}
                {currentStep === 2 && "Provide your base operating city and a brief introduction for clients."}
                {currentStep === 3 && "Select your core photography styles and review your registration."}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                {/* STEP 1: Account Credentials */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          First Name *
                        </Label>
                        <Input
                          required
                          placeholder="e.g. Kasun"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Last Name *
                        </Label>
                        <Input
                          required
                          placeholder="e.g. Perera"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        required
                        placeholder="kasun@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Create Password *
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
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Contact Phone
                        </Label>
                        <Input
                          placeholder="077 123 4567"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Location & Portfolio */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Base Operating City
                      </Label>
                      <Input
                        placeholder="e.g. Colombo / Kandy / Galle"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Short Bio & Style Introduction
                      </Label>
                      <Textarea
                        placeholder="Briefly describe your photography style, years of experience, or equipment..."
                        rows={4}
                        value={formData.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Specializations & Review */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Select Photography Specializations
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {SPECIALIZATION_OPTIONS.map((spec) => {
                          const selected = formData.specializations.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpecialization(spec)}
                              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                                selected
                                  ? "bg-[#0e2d5c] text-white border-[#0e2d5c]"
                                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                              }`}
                            >
                              {selected ? `✓ ${spec}` : `+ ${spec}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary Box */}
                    <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 text-xs space-y-1.5">
                      <span className="font-bold text-blue-950 dark:text-blue-200 block">
                        Summary Review
                      </span>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        <strong>Name:</strong> {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        <strong>Operating City:</strong> {formData.city || "Not specified"}
                      </p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        <strong>Selected Specialties:</strong>{" "}
                        {formData.specializations.join(", ") || "None selected"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="h-10 px-4 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                  </Button>
                ) : (
                  <span className="text-[11px] text-zinc-400">Step 1 of 3</span>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="h-10 px-6 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                  >
                    Next Step
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
                  >
                    {loading ? "Submitting Application..." : "Submit Registration"}
                  </Button>
                )}
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
