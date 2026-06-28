"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";

type BusinessAdvisoryCardProps = {
  conversionRate: number;
  totalBookings: number;
};

export function BusinessAdvisoryCard({
  conversionRate,
  totalBookings,
}: BusinessAdvisoryCardProps) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-zinc-950 text-white p-5 flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Business Advisory</span>
        <h3 className="text-body-base-bold font-bold mt-1 text-white">Recommended Decisions</h3>
        <p className="text-xs text-zinc-350 leading-relaxed mt-4">
          {conversionRate < 50
            ? "Your booking conversion rate is under 50%. Clients are requesting reservations, but a high percentage are not reaching Confirmed. We suggest following up quicker on proposed quotation emails and reviewing if your deposit values are too high."
            : totalBookings > 10
            ? "Your business conversion and traction are excellent! You should consider raising prices for your highest-ranking event packages or offering customized premium upgrades during the quotation process."
            : "Your reservation patterns are stable. Keep client communication channels active and ensure your packages page is fully updated with current service descriptions to attract more leads."}
        </p>
      </div>
      <div className="border-t border-zinc-800 pt-4 mt-6 flex items-center gap-3">
        <ArrowUpDown className="h-5 w-5 text-blue-500" />
        <div className="text-[11px] text-zinc-400">
          Generated automatically based on range conversion indicators
        </div>
      </div>
    </Card>
  );
}
