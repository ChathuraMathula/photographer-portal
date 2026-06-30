"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, BellRing, ShieldAlert, Sparkles } from "lucide-react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { TopBarPreferencesCard } from "@/components/dashboard/profile/TopBarPreferencesCard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export default function UserSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderEmails, setReminderEmails] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  const context = usePhotographerDashboardContext();

  // Fetch current user notification settings
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/users/settings`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load user settings");
        const data = await res.json();
        setEmailNotifications(data.emailNotificationsEnabled);
        setReminderEmails(data.reminderEmailsEnabled);
        setInAppNotifications(data.inAppNotificationsEnabled ?? true);
      } catch (err: any) {
        toast.error(err.message || "Could not fetch settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailNotificationsEnabled: emailNotifications,
          reminderEmailsEnabled: reminderEmails,
          inAppNotificationsEnabled: inAppNotifications,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update settings");

      // Broadcast to listeners (e.g. NotificationBell in layout) for real-time update
      window.dispatchEvent(
        new CustomEvent("user-settings-saved", {
          detail: {
            emailNotificationsEnabled: emailNotifications,
            reminderEmailsEnabled: reminderEmails,
            inAppNotificationsEnabled: inAppNotifications,
          },
        })
      );

      // Save TopBar preferences to photographer profile if context is available
      if (context && context.role === "PHOTOGRAPHER") {
        await context.handleSaveProfile({ preventDefault: () => {} } as any);
      }

      toast.success("Settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2">
          User Settings
        </h1>
        <p className="text-body-small text-zinc-500 mt-1">
          Customize your platform notification options, alert triggers, and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Main Settings Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BellRing className="h-5 w-5 text-indigo-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Choose how and when you want to receive communications from the photographer portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Option 1: General Emails */}
              <div className="flex items-start justify-between p-4 rounded-xl border border-zinc-150/40 bg-zinc-50/20 dark:bg-zinc-950/20 dark:border-zinc-850/60">
                <div className="space-y-1 pr-4">
                  <Label className="text-body-small-bold font-bold text-zinc-850 dark:text-zinc-200">
                    Transactional Emails
                  </Label>
                  <p className="text-body-caption text-zinc-500 leading-normal">
                    Receive instant notifications for reservation confirmations, proposals, invoices, and message logs.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-800 text-primary-dark focus:ring-primary-dark cursor-pointer mt-1"
                />
              </div>

              {/* Option 2: Automated Reminders */}
              <div className="flex items-start justify-between p-4 rounded-xl border border-zinc-150/40 bg-zinc-50/20 dark:bg-zinc-950/20 dark:border-zinc-850/60">
                <div className="space-y-1 pr-4">
                  <Label className="text-body-small-bold font-bold text-zinc-850 dark:text-zinc-200">
                    Deadline Reminders
                  </Label>
                  <p className="text-body-caption text-zinc-500 leading-normal">
                    Trigger automatic background payment reminders and upcoming booking reminders for photographers and customers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={reminderEmails}
                  onChange={(e) => setReminderEmails(e.target.checked)}
                  className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-800 text-primary-dark focus:ring-primary-dark cursor-pointer mt-1"
                />
              </div>

              {/* Option 3: In App Notifications */}
              <div className="flex items-start justify-between p-4 rounded-xl border border-zinc-150/40 bg-zinc-50/20 dark:bg-zinc-950/20 dark:border-zinc-850/60">
                <div className="space-y-1 pr-4">
                  <Label className="text-body-small-bold font-bold text-zinc-850 dark:text-zinc-200">
                    In-App Alerts
                  </Label>
                  <p className="text-body-caption text-zinc-500 leading-normal">
                    Enable the notification bell badge inside the dashboard toolbar to see real-time updates while active.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifications}
                  onChange={(e) => setInAppNotifications(e.target.checked)}
                  className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-800 text-primary-dark focus:ring-primary-dark cursor-pointer mt-1"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary h-11 px-8 gap-2 font-semibold shadow-md cursor-pointer transition-all"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving Changes..." : "Save Settings"}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Top Bar Preferences - Only for Photographers */}
          {context && context.role === "PHOTOGRAPHER" && (
            <TopBarPreferencesCard
              showManualBookingInTopbar={context.showManualBookingInTopbar}
              onShowManualBookingInTopbarChange={context.setShowManualBookingInTopbar}
              showAcceptBookingsInTopbar={context.showAcceptBookingsInTopbar}
              onShowAcceptBookingsInTopbarChange={context.setShowAcceptBookingsInTopbar}
            />
          )}
        </div>

        {/* Informational Sidebar */}
        <div className="space-y-6">
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-body-small-bold font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Security Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-body-caption text-zinc-500 space-y-3 leading-relaxed">
              <p>
                Notification alerts are sent to the verified email address linked to your profile credentials.
              </p>
              <p>
                To change your password or general user profile details, navigate to the <span className="font-semibold text-zinc-800 dark:text-white">Profile Details</span> tab instead.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-gradient-to-br from-indigo-50/30 to-blue-50/10 dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader>
              <CardTitle className="text-body-small-bold font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Upcoming Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-body-caption text-zinc-500 leading-relaxed">
              <p>
                SMS integration, web push configurations, and customized reminder cron intervals will be available in future releases.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
