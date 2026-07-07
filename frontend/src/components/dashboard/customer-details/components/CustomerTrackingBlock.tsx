"use client";

import React from "react";
import { Copy, Check } from "lucide-react";

interface CustomerTrackingBlockProps {
  reservationId: string;
  reservationToken?: string;
  copiedId: boolean;
  copiedLink: boolean;
  handleCopyId: () => void;
  handleCopyLink: () => void;
}

export function CustomerTrackingBlock({
  reservationId,
  reservationToken,
  copiedId,
  copiedLink,
  handleCopyId,
  handleCopyLink,
}: CustomerTrackingBlockProps) {
  const originUrl =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-body-caption font-semibold text-zinc-400">Reservation ID</p>
          <p className="font-mono text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 select-all">
            {reservationId}
          </p>
        </div>
        <button
          onClick={handleCopyId}
          type="button"
          className="flex h-8 items-center gap-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-body-caption text-zinc-655 dark:text-zinc-350 hover:text-primary-dark dark:hover:text-white transition-all cursor-pointer font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none"
        >
          {copiedId ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {reservationToken && (
        <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850">
          <p className="text-body-caption font-semibold text-zinc-400 mb-1.5">Client Tracking Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 block truncate rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 text-body-caption select-all text-zinc-655 dark:text-zinc-350">
              {`${originUrl}/book/track/${reservationToken}`}
            </code>
            <button
              onClick={handleCopyLink}
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-primary-dark dark:hover:text-white hover:border-zinc-350 dark:hover:border-zinc-750 transition-all cursor-pointer shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none"
              title="Copy link"
            >
              {copiedLink ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
