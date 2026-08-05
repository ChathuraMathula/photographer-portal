"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, Camera, ShieldCheck, ArrowRight, Building2 } from "lucide-react";

export function CustomerLoginForm() {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

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
    } catch (err: any) {
      setCustomerError(err.message || "Error requesting sign in link");
    } finally {
      setCustomerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0e2d5c] dark:text-blue-300 border border-blue-200/60 text-[11px] font-bold">
          <Mail className="h-3.5 w-3.5" />
          Customer Access
        </div>
        <h1 className="text-title-large text-primary-dark dark:text-white leading-tight">
          Customer Portal Access
        </h1>
        <p className="text-body-small text-zinc-500 dark:text-zinc-400">
          Enter your email to receive a passwordless sign-in link to view bookings, sessions, and invoices.
        </p>
      </div>

      <form onSubmit={handleCustomerSubmit} className="space-y-5">
        {magicLinkSent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-center space-y-3 animate-in fade-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
              Magic Sign-in Link Sent!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              We sent a passwordless sign-in link to <strong>{customerEmail}</strong>. Check your email inbox to access your portal.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMagicLinkSent(false)}
              className="mt-2 text-xs h-8"
            >
              Use a different email
            </Button>
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
                Your Email Address
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
              No password required! We will send a secure sign-in link directly to your email.
            </p>

            <Button
              className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none gap-2 h-11 md:h-12 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              type="submit"
              disabled={customerLoading}
            >
              <Mail className="h-4 w-4" />
              {customerLoading ? "Sending Link..." : "Send Magic Sign-in Link"}
            </Button>
          </>
        )}
      </form>

      {/* Portal Switcher Navigation Footer */}
      <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center md:text-left">
          Are you a team member?
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/portal/login"
            className="flex-1 inline-flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all group"
          >
            <span className="flex items-center gap-1.5 font-bold">
              <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Provider, Studio & Admin Portal Login
            </span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
