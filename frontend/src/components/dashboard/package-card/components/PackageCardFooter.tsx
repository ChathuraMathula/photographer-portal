import React from "react";
import { type Package } from "@/types";
import { CardFooter } from "@/components/ui/card";

type Props = {
  pkg: Package;
};

export function PackageCardFooter({ pkg }: Props) {
  return (
    <CardFooter className="border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 flex flex-col sm:flex-row justify-between items-baseline gap-2">
      <div className="flex items-baseline gap-1">
        <span className="text-body-caption font-semibold text-zinc-400">
          LKR
        </span>
        <span className="text-title-base text-zinc-950 dark:text-white font-bold">
          {(pkg.priceInCents / 100).toLocaleString()}
        </span>
      </div>
      <div className="text-[11px] font-medium text-zinc-505 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
        {pkg.depositType === "fixed" ? (
          <span>
            Deposit: LKR {((pkg.depositValue ?? 0) / 100).toLocaleString()}
          </span>
        ) : pkg.depositType === "percentage" ? (
          <span>Deposit: {pkg.depositValue}%</span>
        ) : (
          <span className="italic">Deposit: Universal</span>
        )}
      </div>
    </CardFooter>
  );
}
