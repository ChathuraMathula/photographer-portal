"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DepositPolicyCardProps = {
  universalDepositType: string;
  universalDepositValue: number;
  onUniversalDepositTypeChange: (v: string) => void;
  onUniversalDepositValueChange: (v: number) => void;
};

export function DepositPolicyCard({
  universalDepositType,
  universalDepositValue,
  onUniversalDepositTypeChange,
  onUniversalDepositValueChange,
}: DepositPolicyCardProps) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-855 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Default Deposit Policy</CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          Configure a default deposit amount (fixed LKR or percentage of total package price) used when sending proposals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="universalDepositType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Deposit Rule Type
            </Label>
            <Select
              value={universalDepositType}
              onValueChange={onUniversalDepositTypeChange}
            >
              <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 text-body-small border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <SelectItem value="fixed" className="cursor-pointer">Fixed Price (LKR)</SelectItem>
                <SelectItem value="percentage" className="cursor-pointer">Percentage (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="universalDepositValue" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              {universalDepositType === "fixed" ? "Deposit Amount (LKR)" : "Deposit Percentage (%)"}
            </Label>
            <Input
              id="universalDepositValue"
              type="number"
              min="0"
              max={universalDepositType === "percentage" ? "100" : undefined}
              value={universalDepositValue}
              onChange={(e) => onUniversalDepositValueChange(Number(e.target.value))}
              placeholder={universalDepositType === "fixed" ? "e.g. 5000" : "e.g. 10"}
              className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
