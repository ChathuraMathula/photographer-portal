"use client";

import { useState } from "react";
import { copyToClipboard } from "@/utils/copyToClipboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy, ExternalLink } from "lucide-react";

type Props = {
  photographerFirstName: string;
  trackingToken: string;
  origin: string;
};

export function BookingConfirmed({
  photographerFirstName,
  trackingToken,
  origin,
}: Props) {
  const [copied, setCopied] = useState(false);
  const trackUrl = `${origin}/book/track/${trackingToken}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(trackUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
          <Check className="h-6 w-6" />
        </div>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">
          Request Submitted!
        </CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1 max-w-sm mx-auto">
          Your request has been sent to {photographerFirstName}. They will
          contact you to confirm the details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2 pb-6 px-6">
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 p-4">
          <p className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Track Reservation Status
          </p>
          <p className="text-body-caption text-zinc-500 mb-3">
            Save this unique tracking URL to monitor updates on your booking:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 block truncate rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 text-body-caption select-all text-zinc-650 dark:text-zinc-350">
              {trackUrl}
            </code>
            <button
              onClick={handleCopy}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-primary-dark dark:hover:text-white hover:border-zinc-350 dark:hover:border-zinc-750 transition-all cursor-pointer"
              title="Copy link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <a
          href={trackUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-body-small-s font-semibold shadow-md cursor-pointer transition-all mt-4"
        >
          <ExternalLink className="h-4 w-4" />
          Open Tracking Page
        </a>
      </CardContent>
    </Card>
  );
}
