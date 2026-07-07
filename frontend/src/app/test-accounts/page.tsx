"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AccountRow } from "./components/AccountRow";
import { testAccounts } from "./data/accountsData";

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
              Use the credentials below to log into the portal under various
              user roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-850 p-0">
            {testAccounts.map((acc, index) => (
              <AccountRow
                key={index}
                account={acc}
                index={index}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
