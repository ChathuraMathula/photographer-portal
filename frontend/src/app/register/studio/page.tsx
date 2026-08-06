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
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  AtSign,
  Globe,
  Mail,
  Phone,
  KeyRound,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Users,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { RegistrationLocationPicker, type LocationState } from "@/components/maps/RegistrationLocationPicker";

const STEPS = [
  { step: 1, label: "Email Verification", icon: Mail },
  { step: 2, label: "Phone Verification", icon: Phone },
  { step: 3, label: "Studio Credentials", icon: Building2 },
  { step: 4, label: "Studio Handle & Slug", icon: AtSign },
  { step: 5, label: "Location & Details", icon: MapPin },
];

export default function RegisterStudioWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    studioName: "",
    username: "",
    studioSlug: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    description: "",
  });

  const [location, setLocation] = useState<LocationState>({
    city: "",
    district: "",
    coordinates: "",
    locationMapLink: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // OTP state
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);

  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);

  const [checkingHandle, setCheckingHandle] = useState(false);

  // --- Formatting ---
  const formatSlug = (val: string) =>
    val.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-{2,}/g, "-");

  const formatUsername = (val: string) =>
    val.toLowerCase().replace(/^@/, "").replace(/[^\w]/g, "_").replace(/_+/g, "_");

  // --- OTP Handlers ---
  const handleSendEmailOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    try {
      setSendingEmailOtp(true);
      const availRes = await fetch(`${API}/auth/check-availability?email=${encodeURIComponent(formData.email)}`);
      const availData = await availRes.json();
      if (!availData.emailAvailable) {
        toast.error("An account with this email address already exists.");
        return;
      }
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: formData.email, type: "EMAIL" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setEmailOtpSent(true);
      toast.success(`OTP sent to ${formData.email}! Check Maildev (localhost:1080)`);
    } catch (err: any) {
      const msg = err?.message === "Failed to fetch"
        ? "Cannot connect to backend. Ensure backend is running on port 4001."
        : err?.message || "Error sending email OTP";
      toast.error(msg);
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      toast.error("Please enter the full 6-digit OTP code.");
      return;
    }
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    try {
      setVerifyingEmailOtp(true);
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: formData.email, otp: emailOtp, type: "EMAIL" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      setEmailVerified(true);
      toast.success("Email address verified successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired OTP code.");
    } finally {
      setVerifyingEmailOtp(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!formData.phone || formData.phone.trim().length < 8) {
      toast.error("Please enter a valid phone number first.");
      return;
    }
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    try {
      setSendingPhoneOtp(true);
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: formData.phone, type: "SMS" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send SMS OTP");
      setPhoneOtpSent(true);
      toast.success(`SMS OTP sent to ${formData.phone}! Open /sms-tester to view.`);
    } catch (err: any) {
      const msg = err?.message === "Failed to fetch"
        ? "Cannot connect to backend. Ensure backend is running on port 4001."
        : err?.message || "Error sending SMS OTP";
      toast.error(msg);
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length < 6) {
      toast.error("Please enter the full 6-digit SMS OTP code.");
      return;
    }
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    try {
      setVerifyingPhoneOtp(true);
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: formData.phone, otp: phoneOtp, type: "SMS" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      setPhoneVerified(true);
      toast.success("Phone number verified successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired SMS OTP code.");
    } finally {
      setVerifyingPhoneOtp(false);
    }
  };

  // --- Step Navigation ---
  const handleNextStep = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

    if (currentStep === 1 && !emailVerified) {
      toast.error("Please verify your email address via OTP before proceeding.");
      return;
    }
    if (currentStep === 2 && !phoneVerified) {
      toast.error("Please verify your phone number via SMS OTP before proceeding.");
      return;
    }
    if (currentStep === 3) {
      if (!formData.studioName.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Please fill in studio name and manager name fields.");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.username || !formData.studioSlug) {
        toast.error("Please enter both studio username and studio slug.");
        return;
      }
      try {
        setCheckingHandle(true);
        const cleanSlug = formData.studioSlug.replace(/-+$/, "");
        const res = await fetch(
          `${API}/auth/check-availability?username=${encodeURIComponent(formData.username)}&bookingSlug=${encodeURIComponent(cleanSlug)}`
        );
        const data = await res.json();
        if (!data.usernameAvailable) {
          toast.error(`Username "@${formData.username}" is already taken.`);
          return;
        }
        if (!data.bookingSlugAvailable) {
          toast.error(`Studio slug "${cleanSlug}" is already taken.`);
          return;
        }
        setFormData((prev) => ({ ...prev, studioSlug: cleanSlug }));
      } catch {
        // allow proceeding
      } finally {
        setCheckingHandle(false);
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/auth/register/studio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioName: formData.studioName,
          username: formData.username,
          studioSlug: formData.studioSlug.replace(/-+$/, ""),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          city: location.city,
          district: location.district,
          baseLocation: formData.address || (location.city ? `${location.city}${location.district ? `, ${location.district}` : ""}` : ""),
          address: formData.address,
          locationMapLink: location.locationMapLink,
          coordinates: location.coordinates,
          description: formData.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Studio registration failed.");
      setSubmitted(true);
      toast.success("Studio account registered successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during studio registration.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Header */}
      <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800/80 px-4 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/photographers" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0e2d5c] to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">S</div>
            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none">Seya<span className="text-blue-600 dark:text-blue-400">Roo</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sms-tester" target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 text-[11px] font-bold hover:bg-emerald-100 transition-colors">
              <Smartphone className="h-3.5 w-3.5" /><span>SMS Dev Inbox</span>
            </Link>
            <Link href="/photographers" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />Back to Showcase
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 my-4">
        {submitted ? (
          <Card className="border border-indigo-200 dark:border-indigo-900/60 shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden text-center p-6 sm:p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Studio Application Under Review</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
                Thank you for registering <strong>{formData.studioName}</strong> on SeyaRoo! Your studio application is currently undergoing review by our management team.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" /><span>Studio Activation Information</span>
              </div>
              <ul className="list-disc list-inside text-zinc-500 space-y-1 text-[11px]">
                <li>Email (Verified): <strong>{formData.email}</strong></li>
                <li>Phone (Verified): <strong>{formData.phone}</strong></li>
                <li>Studio Username: <strong>@{formData.username.replace(/^@/, '')}</strong></li>
                <li>Studio Showcase: <strong>seyaroo.com/studios/{formData.studioSlug}</strong></li>
                {(location.city || location.district) && <li>Location: <strong>{location.city}{location.district ? `, ${location.district}` : ""}</strong></li>}
                <li>Team Capacity: Up to 5 sub-photographers (Free Tier)</li>
              </ul>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/photographers"><Button className="h-10 px-6 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs rounded-xl cursor-pointer">Return to Showcase</Button></Link>
              <Link href="/portal/login"><Button variant="outline" className="h-10 px-6 font-bold text-xs rounded-xl cursor-pointer">Studio & Admin Login</Button></Link>
            </div>
          </Card>
        ) : (
          <Card className="border border-zinc-200/70 dark:border-zinc-800/80 shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
            {/* Progress Header */}
            <div className="bg-zinc-50/80 dark:bg-zinc-950/80 p-5 border-b border-zinc-200/60 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                  <Building2 className="h-4 w-4" />Studio Organization Registration
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                  Step {currentStep} of 5 ({Math.round(progressPercentage)}%)
                </span>
              </div>
              <div className="relative w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 transition-all duration-300 ease-out rounded-full" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const isCompleted = currentStep > s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div key={s.step} className="flex flex-col items-center gap-1 text-center">
                      <div className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-800 shadow-sm" : "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-400"}`}>
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-[9px] font-bold leading-tight hidden sm:block truncate max-w-[70px] ${isCurrent ? "text-indigo-700 dark:text-indigo-400" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <CardHeader className="border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-indigo-600" />Studio Organization Registration
                </span>
              </div>
              <CardTitle className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                {currentStep === 1 && "Step 1: Email OTP Verification"}
                {currentStep === 2 && "Step 2: Phone SMS OTP Verification"}
                {currentStep === 3 && "Step 3: Studio Credentials & Manager"}
                {currentStep === 4 && "Step 4: Studio Username & Profile Slug"}
                {currentStep === 5 && "Step 5: Location, Address & Details"}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                {currentStep === 1 && "Verify your studio official email address via a 6-digit OTP code."}
                {currentStep === 2 && "Verify your contact phone number via SMS OTP."}
                {currentStep === 3 && "Enter studio name, manager details, and login password."}
                {currentStep === 4 && "Choose your @username and public studio profile slug."}
                {currentStep === 5 && "Pin your studio location on the map and add business details."}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">

                {/* STEP 1: Email OTP */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>Studio Official Email *</span>
                        {emailVerified && <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Email Verified</span>}
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <Input type="email" required disabled={emailVerified} placeholder="contact@apexvisuals.lk" value={formData.email}
                            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setEmailVerified(false); setEmailOtpSent(false); }}
                            className="h-11 pl-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                        </div>
                        {!emailVerified && (
                          <Button type="button" onClick={handleSendEmailOtp} disabled={sendingEmailOtp || !formData.email} className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0">
                            {sendingEmailOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {emailOtpSent && !emailVerified && (
                      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-blue-600" />Enter 6-Digit Email OTP</Label>
                          <span className="text-[10px] text-zinc-500">Check Maildev (localhost:1080)</span>
                        </div>
                        <div className="flex gap-2">
                          <Input type="text" maxLength={6} placeholder="123456" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)}
                            className="h-11 text-center text-sm font-mono font-bold tracking-widest rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" />
                          <Button type="button" onClick={handleVerifyEmailOtp} disabled={verifyingEmailOtp || emailOtp.length < 6} className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0">
                            {verifyingEmailOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                          </Button>
                        </div>
                      </div>
                    )}
                    {emailVerified && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />Email verified. Click Next Step to continue.
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Phone OTP */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>Contact Phone Number *</span>
                        {phoneVerified && <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Phone Verified</span>}
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <Input type="tel" required disabled={phoneVerified} placeholder="011 234 5678" value={formData.phone}
                            onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setPhoneVerified(false); setPhoneOtpSent(false); }}
                            className="h-11 pl-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                        </div>
                        {!phoneVerified && (
                          <Button type="button" onClick={handleSendPhoneOtp} disabled={sendingPhoneOtp || !formData.phone} className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0">
                            {sendingPhoneOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send SMS OTP"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {phoneOtpSent && !phoneVerified && (
                      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-indigo-600" />Enter 6-Digit SMS OTP</Label>
                          <Link href="/sms-tester" target="_blank" className="text-[11px] text-indigo-600 hover:underline font-bold inline-flex items-center gap-1">
                            Open SMS Inbox <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Input type="text" maxLength={6} placeholder="123456" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)}
                            className="h-11 text-center text-sm font-mono font-bold tracking-widest rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" />
                          <Button type="button" onClick={handleVerifyPhoneOtp} disabled={verifyingPhoneOtp || phoneOtp.length < 6} className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0">
                            {verifyingPhoneOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify SMS"}
                          </Button>
                        </div>
                      </div>
                    )}
                    {phoneVerified && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />Phone number verified. Click Next Step to continue.
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Studio Credentials */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Studio / Business Name *</Label>
                      <Input required placeholder="e.g. Apex Visuals Studio" value={formData.studioName}
                        onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                        className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Manager First Name *</Label>
                        <Input required placeholder="e.g. Ruwan" value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Manager Last Name *</Label>
                        <Input required placeholder="e.g. Fernando" value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Create Password *</Label>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} required minLength={6} placeholder="At least 6 characters"
                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-10 pr-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Confirm Password *</Label>
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} required minLength={6} placeholder="Re-enter password"
                            value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`h-10 pr-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500" : ""}`} />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Studio Username & Slug */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          <span>Studio Username *</span>
                          <span className="text-[10px] text-zinc-400 font-mono">e.g. @apexvisuals</span>
                        </Label>
                        <div className="relative">
                          <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <Input required placeholder="apexvisuals" value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: formatUsername(e.target.value) })}
                            className="h-11 pl-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 font-mono" />
                        </div>
                        <p className="text-[10px] text-zinc-400">Spaces become underscores (<code>_</code>).</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          <span>Studio Profile Slug *</span>
                          <span className="text-[10px] text-zinc-400 font-mono">seyaroo.com/studios/slug</span>
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <Input required placeholder="apex-visuals" value={formData.studioSlug}
                            onChange={(e) => setFormData({ ...formData, studioSlug: formatSlug(e.target.value) })}
                            onBlur={(e) => setFormData({ ...formData, studioSlug: e.target.value.replace(/-+$/, "") })}
                            className="h-11 pl-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 font-mono" />
                        </div>
                        <p className="text-[10px] text-zinc-400">Spaces become hyphens (<code>-</code>).</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Location, Address & Details */}
                {currentStep === 5 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Studio Description */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Studio Description & Services</Label>
                      <Textarea placeholder="Describe your studio's services, photography styles, years of experience..."
                        rows={3} value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                        className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 resize-none" />
                    </div>

                    {/* Physical Address */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Studio Physical Address</Label>
                      <Input placeholder="No. 123, Galle Road, Colombo 03" value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800" />
                    </div>

                    {/* Location Map Picker */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Studio Location on Map</Label>
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <RegistrationLocationPicker
                          location={location}
                          onChange={(updated) => setLocation((prev) => ({ ...prev, ...updated }))}
                        />
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-start gap-3">
                      <Users className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Studio Team Capacity</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Free Tier includes up to <strong>5 team photographers</strong>. You can add team members after approval through your studio dashboard.</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                        <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-indigo-600" />Studio Registration Summary</span>
                        <button type="button" onClick={() => setCurrentStep(1)} className="text-[11px] text-indigo-600 hover:underline cursor-pointer">Edit Details</button>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Studio Name:</strong> {formData.studioName}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Manager:</strong> {formData.firstName} {formData.lastName}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Email (Verified):</strong> {formData.email}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Phone (Verified):</strong> {formData.phone}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Username:</strong> @{formData.username}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Studio Showcase:</strong> seyaroo.com/studios/{formData.studioSlug}</p>
                      {(location.city || location.district) && <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Location:</strong> {location.city}{location.district ? `, ${location.district}` : ""}</p>}
                      {location.locationMapLink && <p className="text-[11px] text-zinc-600 dark:text-zinc-400"><strong>Map Link:</strong> <a href={location.locationMapLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{location.locationMapLink}</a></p>}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrevStep} disabled={checkingHandle} className="h-10 px-4 font-bold text-xs rounded-xl cursor-pointer">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back (Step {currentStep - 1})
                  </Button>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-bold">Step 1 of 5</span>
                )}

                {currentStep < 5 ? (
                  <Button type="button"
                    disabled={checkingHandle || (currentStep === 1 && !emailVerified) || (currentStep === 2 && !phoneVerified)}
                    onClick={handleNextStep}
                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                    {checkingHandle ? (
                      <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" />Checking...</span>
                    ) : (
                      <span className="flex items-center gap-1.5">Next Step <ArrowRight className="h-3.5 w-3.5" /></span>
                    )}
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md">
                    {loading ? "Submitting Studio..." : "Submit Studio Application"}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-800/50">
        © {new Date().getFullYear()} SeyaRoo Photography Platform. All rights reserved.
      </footer>
    </div>
  );
}
