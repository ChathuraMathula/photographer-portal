"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Shield, ShieldAlert, Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Account = {
  role: string;
  name: string;
  email: string;
  password: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

export default function TestAccountsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const accounts: Account[] = [
    {
      role: "Super Admin",
      name: "System Admin",
      email: "admin@photoportal.com",
      password: "SuperSecret123!",
      description: "Full platform permissions: manages all users, settings, and views aggregated business reports.",
      icon: <ShieldAlert className="h-5 w-5" />,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      role: "Standard Admin",
      name: "Agency Admin",
      email: "agency@photoportal.com",
      password: "AdminSecret123!",
      description: "Agency level access: can manage photographers, view reports, but cannot delete Super Admins.",
      icon: <Shield className="h-5 w-5" />,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      role: "Photographer 1",
      name: "Sarah Johnson",
      email: "sarah@photoportal.com",
      password: "Photographer123!",
      description: "Sarah's account: features pre-populated booking requests, financial timelines, packages, and calendar entries.",
      icon: <Camera className="h-5 w-5" />,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      role: "Photographer 2",
      name: "Michael Fernando",
      email: "michael@photoportal.com",
      password: "Photographer123!",
      description: "Michael's account: features corporate event bookings, customized package offerings, and offline settings.",
      icon: <Camera className="h-5 w-5" />,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Login
          </Link>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Developer Sandbox
          </span>
        </div>

        <Card className="border border-zinc-200/60 dark:border-zinc-800/80 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-850 pb-6">
            <CardTitle className="text-title-large text-zinc-900 dark:text-white font-extrabold">
              Demo Portal Test Accounts
            </CardTitle>
            <CardDescription className="text-body-small text-zinc-500 dark:text-zinc-405 mt-2">
              Use the credentials below to log into the portal under various user roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-850 p-0">
            {accounts.map((acc, index) => (
              <div 
                key={index} 
                className="p-6 flex flex-col md:flex-row md:items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all"
              >
                {/* Icon wrapper */}
                <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl ${acc.iconBg} ${acc.iconColor}`}>
                  {acc.icon}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${acc.iconBg} ${acc.iconColor}`}>
                      {acc.role}
                    </span>
                    <h4 className="text-body-small-bold font-bold text-zinc-900 dark:text-white">
                      {acc.name}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-0.5">
                    {acc.description}
                  </p>

                  {/* Credentials blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    {/* Email */}
                    <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/30 dark:border-zinc-850 p-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase select-none">
                        Email
                      </span>
                      <span className="text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 font-mono pl-2 truncate flex-1 text-right pr-2">
                        {acc.email}
                      </span>
                      <button
                        onClick={() => copyToClipboard(acc.email, `${index}-email`)}
                        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-750 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy email"
                      >
                        {copiedId === `${index}-email` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/30 dark:border-zinc-850 p-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase select-none">
                        Password
                      </span>
                      <span className="text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 font-mono pl-2 truncate flex-1 text-right pr-2">
                        {acc.password}
                      </span>
                      <button
                        onClick={() => copyToClipboard(acc.password, `${index}-password`)}
                        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-750 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy password"
                      >
                        {copiedId === `${index}-password` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
