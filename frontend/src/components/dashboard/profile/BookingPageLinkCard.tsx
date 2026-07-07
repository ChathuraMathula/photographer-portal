"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BookingPageLinkCardProps = {
  bookingSlug: string;
};

export function BookingPageLinkCard({ bookingSlug }: BookingPageLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/book/${bookingSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">
          Public Booking Page Link
        </CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          Share this link with your customers so they can view your
          availability, packages, and submit booking requests directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        <div className="flex gap-2">
          <Input
            readOnly
            value={
              typeof window !== "undefined"
                ? `${window.location.origin}/book/${bookingSlug}`
                : ""
            }
            className="h-11 w-full min-w-0 rounded-xl bg-white dark:bg-zinc-950 font-mono text-body-caption border-zinc-200 dark:border-zinc-800 focus-visible:ring-0 focus-visible:ring-offset-0 select-all cursor-text"
          />
          <Button
            type="button"
            onClick={handleCopy}
            className="btn btn-outline h-11 px-4 py-0 min-w-0 md:min-w-0 font-medium text-body-small-s text-zinc-700 dark:text-zinc-300 shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
