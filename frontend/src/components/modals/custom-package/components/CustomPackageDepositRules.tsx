"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DepositRulesProps {
  depositType: "universal" | "fixed" | "percentage";
  setDepositType: (val: "universal" | "fixed" | "percentage") => void;
  depositValue: number;
  setDepositValue: (val: number) => void;
  errors: Record<string, string>;
}

export function CustomPackageDepositRules({
  depositType,
  setDepositType,
  depositValue,
  setDepositValue,
  errors,
}: DepositRulesProps) {
  return (
    <div className="border-t pt-4 mt-2 dark:border-zinc-800 space-y-4">
      <h3 className="text-body-small-s font-semibold text-zinc-800 dark:text-zinc-200">
        Advanced Payment Policy
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="cust-depositType"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Deposit Rule
          </Label>
          <select
            id="cust-depositType"
            value={depositType}
            onChange={(e: any) => setDepositType(e.target.value)}
            className="w-full h-[50px] bg-white dark:bg-zinc-950 text-body-small border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary-dark cursor-pointer"
          >
            <option value="universal">Use Universal Default</option>
            <option value="fixed">Fixed Price (LKR)</option>
            <option value="percentage">Percentage (%)</option>
          </select>
        </div>

        {depositType !== "universal" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <Label
              htmlFor="cust-depositValue"
              className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
            >
              {depositType === "fixed"
                ? "Deposit Value (LKR)"
                : "Deposit Value (%)"}
            </Label>
            <Input
              id="cust-depositValue"
              type="number"
              min="0"
              value={depositValue}
              onChange={(e) => setDepositValue(Number(e.target.value))}
              className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
            {errors.depositValue && (
              <p className="text-red-500 text-xs mt-1">{errors.depositValue}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
