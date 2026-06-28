"use client";

import React from "react";
import { type Package } from "@/types";
import { ProposalPackageCard } from "../ProposalPackageCard";

type ProposalPackagesGridProps = {
  packages: Package[];
  selectedPkgId: string | null;
  status: string;
  isExpired: boolean;
  clientSelectedPackageId?: string;
  onSelectPackage: (id: string) => void;
};

export function ProposalPackagesGrid({
  packages,
  selectedPkgId,
  status,
  isExpired,
  clientSelectedPackageId,
  onSelectPackage,
}: ProposalPackagesGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {packages.map((pkg) => (
        <ProposalPackageCard
          key={pkg.id}
          pkg={pkg}
          isSelected={selectedPkgId === pkg.id}
          isConfirmed={status === "CONFIRMED" || isExpired}
          isMySelection={
            status === "CONFIRMED" && clientSelectedPackageId === pkg.id
          }
          onSelect={onSelectPackage}
        />
      ))}
    </div>
  );
}
