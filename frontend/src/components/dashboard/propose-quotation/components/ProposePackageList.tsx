import React from "react";
import { type Package } from "@/types";
import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PackageListItem } from "./PackageListItem";
import { CustomPackageListItem } from "./CustomPackageListItem";

type Props = {
  packages: Package[]; selectedPkgIds: string[]; onTogglePackage: (id: string, checked: boolean) => void;
  packageDeposits: Record<string, string>; setPackageDeposits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customPackage: CustomPackageValues | null; setCustomPackage: (val: CustomPackageValues | null) => void;
  isCustomPackageSelected: boolean; setIsCustomPackageSelected: (val: boolean) => void;
  customPackageDeposit: string; setCustomPackageDeposit: (val: string) => void;
  onOpenCustomPackageModal: () => void;
};

export function ProposePackageList({ packages, selectedPkgIds, onTogglePackage, packageDeposits, setPackageDeposits, customPackage, setCustomPackage, isCustomPackageSelected, setIsCustomPackageSelected, customPackageDeposit, setCustomPackageDeposit, onOpenCustomPackageModal }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Choose Package Recommendations</Label>
        <Button type="button" variant="outline" size="sm" onClick={onOpenCustomPackageModal} className="h-8 px-3 text-xs border-dashed text-primary-dark border-primary-dark hover:bg-primary-dark/5 dark:text-white dark:border-zinc-800">+ Custom Package</Button>
      </div>
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl bg-zinc-50/20">
        {packages.length === 0 && !customPackage ? (
          <p className="text-body-small italic text-zinc-400">No packages. Create standard packages or click custom package to define one.</p>
        ) : (
          <>
            {packages.map((pkg) => (
              <PackageListItem key={pkg.id} pkg={pkg} isSelected={selectedPkgIds.includes(pkg.id)} onToggle={(c) => onTogglePackage(pkg.id, c)} depositValue={packageDeposits[pkg.id] ?? ""} onDepositChange={(v) => setPackageDeposits((prev) => ({ ...prev, [pkg.id]: v }))} />
            ))}
            {customPackage && (
              <CustomPackageListItem customPackage={customPackage} isSelected={isCustomPackageSelected} onToggle={setIsCustomPackageSelected} onRemove={() => setCustomPackage(null)} depositValue={customPackageDeposit} onDepositChange={setCustomPackageDeposit} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
