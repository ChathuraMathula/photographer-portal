"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, Check } from "lucide-react";
import { toast } from "sonner";

export default function CustomerSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header Card */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0e2d5c]/10 text-[#0e2d5c] dark:bg-blue-400/10 dark:text-blue-400 flex items-center justify-center font-bold">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Customer Settings & Preferences
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage your portal preferences, notification alerts, and security options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Control how and when you receive email alerts about your photography sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                Booking Status Updates
              </span>
              <span className="text-[11px] text-zinc-500 block leading-relaxed">
                Receive instant emails when a photographer accepts or updates your booking.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emailNotifications ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
              aria-label="Toggle Booking Status Updates"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emailNotifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                Quotation Proposals & Pricing
              </span>
              <span className="text-[11px] text-zinc-500 block leading-relaxed">
                Get notified when a photographer sends package options and price quotes.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setProposalAlerts(!proposalAlerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                proposalAlerts ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
              aria-label="Toggle Quotation Proposals & Pricing"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  proposalAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                Live Chat Notifications
              </span>
              <span className="text-[11px] text-zinc-500 block leading-relaxed">
                Receive email alerts when a photographer sends you a direct message.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setChatNotifications(!chatNotifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                chatNotifications ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
              aria-label="Toggle Live Chat Notifications"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  chatNotifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
            Security & Authentication
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Your Customer Portal uses passwordless magic sign-in links sent directly to your registered email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" />
              Passwordless Magic Link Security Active
            </span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              No passwords to remember or leak! Sign-in links expire safely after 1 hour.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button
          type="button"
          onClick={handleSaveSettings}
          className="h-10 px-6 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
