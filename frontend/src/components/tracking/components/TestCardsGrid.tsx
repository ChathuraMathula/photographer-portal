"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const TEST_CARDS = [
  {
    label: "Sampath Bank (Visa)",
    number: "4532 8511 2233 4455",
    desc: "Sri Lankan Sampath Bank Visa Success",
  },
  {
    label: "Commercial Bank (MC)",
    number: "5254 9622 3344 5566",
    desc: "Sri Lankan Commercial Bank Mastercard Success",
  },
  {
    label: "Bank of Ceylon (Visa)",
    number: "4005 8611 2233 4455",
    desc: "Sri Lankan BOC Visa Success",
  },
  {
    label: "Success (Visa Sandbox)",
    number: "4242 4242 4242 4242",
    desc: "Standard sandbox visa card",
  },
  {
    label: "Insufficient Funds",
    number: "4000 0000 0000 0002",
    desc: "Simulates card declined error",
  },
  {
    label: "Card Expired",
    number: "4000 0000 0000 0005",
    desc: "Simulates expired card rejection",
  },
  {
    label: "Suspected Fraud",
    number: "4000 0000 0000 0008",
    desc: "Simulates bank fraud guard alert",
  },
  {
    label: "Gateway Timeout",
    number: "5555 5555 5555 5555",
    desc: "Simulates 2s server timeout response",
  },
];

type TestCardsGridProps = {
  onSelect: (number: string) => void;
};

export function TestCardsGrid({ onSelect }: TestCardsGridProps) {
  return (
    <div className="bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100/30 dark:border-blue-900/20 space-y-3">
      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Test Sandbox Cards
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
        {TEST_CARDS.map((card, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(card.number)}
            className="flex flex-col text-left p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm cursor-pointer"
          >
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              {card.label}
            </span>
            <span className="font-mono text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">
              {card.number}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
