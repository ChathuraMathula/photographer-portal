import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldX, Mail, CheckCircle2, User, Camera } from "lucide-react";

type Props = {
  formik: any;
  apiError: string;
  isDeactivated?: boolean;
};

export function LoginForm({ formik, apiError, isDeactivated }: Props) {
  const [activeTab, setActiveTab] = useState<"PHOTOGRAPHER" | "CUSTOMER">("PHOTOGRAPHER");
  const [showPassword, setShowPassword] = useState(false);

  // Customer magic link state
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError("");

    if (!customerEmail || !customerEmail.includes("@")) {
      setCustomerError("Please enter a valid email address.");
      return;
    }

    try {
      setCustomerLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/auth/customer/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send magic link");

      setMagicLinkSent(true);
      if (data.magicLinkUrl) {
        setGeneratedLink(data.magicLinkUrl);
      }
    } catch (err: any) {
      setCustomerError(err.message || "Error requesting sign in link");
    } finally {
      setCustomerLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Role / Tab Selector */}
      <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("PHOTOGRAPHER")}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "PHOTOGRAPHER"
              ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          Photographer / Admin
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("CUSTOMER")}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "CUSTOMER"
              ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Customer Sign In
        </button>
      </div>

      <div className="space-y-2 text-center md:text-left mt-4">
        <h1 className="text-title-large text-primary-dark dark:text-white leading-tight">
          {activeTab === "PHOTOGRAPHER"
            ? "Access your photographer portal"
            : "Customer Portal Access"}
        </h1>
        <p className="text-body-small text-zinc-500 dark:text-zinc-400">
          {activeTab === "PHOTOGRAPHER"
            ? "Manage reservations, proposals, and chat with customers in real-time."
            : "Sign in with your email to view reservations, booking status, and invoices."}
        </p>
      </div>

      {activeTab === "PHOTOGRAPHER" ? (
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Account deactivated banner */}
          {isDeactivated && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-200/60 dark:border-red-900/40 flex items-start gap-3">
              <ShieldX className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-body-small-s font-bold text-red-700 dark:text-red-400">
                  Account Suspended
                </p>
                <p className="text-body-caption text-red-600 dark:text-red-500 mt-0.5">
                  Your account has been deactivated by an administrator. Please
                  contact support for assistance.
                </p>
              </div>
            </div>
          )}

          {/* API error */}
          {apiError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...formik.getFieldProps("email")}
              className={`h-11 md:h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-body-caption text-red-500 mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...formik.getFieldProps("password")}
                className={`h-11 md:h-12 pr-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-body-caption text-red-500 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/forgot-password"
              className="text-body-small-s font-semibold text-primary-dark hover:underline dark:text-primary-light transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCustomerSubmit} className="space-y-5">
          {magicLinkSent ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-center space-y-3 animate-in fade-in duration-300">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                Magic Sign-in Link Sent!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                We sent a passwordless sign-in link to <strong>{customerEmail}</strong>. Check your email inbox to access your portal.
              </p>

              {generatedLink && (
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
                  <a
                    href={generatedLink}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0e2d5c] dark:text-blue-400 underline hover:opacity-80"
                  >
                    Click here to verify & sign in directly
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {customerError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                  {customerError}
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="customer-email"
                  className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Your Customer Email
                </Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-11 md:h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950"
                  required
                />
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                No password required! We will send a secure sign-in link directly to your email address.
              </p>

              <Button
                className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none gap-2"
                type="submit"
                disabled={customerLoading}
              >
                <Mail className="h-4 w-4" />
                {customerLoading ? "Sending Link..." : "Send Magic Sign-in Link"}
              </Button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
