import React from "react";
import { type Package } from "@/types";
import { type CustomPackageValues } from "../../CustomPackageModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  packages: Package[];
  selectedPkgIds: string[];
  onTogglePackage: (id: string, checked: boolean) => void;
  packageDeposits: Record<string, string>;
  setPackageDeposits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customPackage: CustomPackageValues | null;
  setCustomPackage: (val: CustomPackageValues | null) => void;
  isCustomPackageSelected: boolean;
  setIsCustomPackageSelected: (val: boolean) => void;
  customPackageDeposit: string;
  setCustomPackageDeposit: (val: string) => void;
  onOpenCustomPackageModal: () => void;
};

export function ProposePackageList({
  packages,
  selectedPkgIds,
  onTogglePackage,
  packageDeposits,
  setPackageDeposits,
  customPackage,
  setCustomPackage,
  isCustomPackageSelected,
  setIsCustomPackageSelected,
  customPackageDeposit,
  setCustomPackageDeposit,
  onOpenCustomPackageModal,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Choose Package Recommendations</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenCustomPackageModal}
          className="h-8 px-3 text-xs border-dashed text-primary-dark border-primary-dark hover:bg-primary-dark/5 dark:text-white dark:border-zinc-800"
        >
          + Custom Package
        </Button>
      </div>
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl bg-zinc-50/20">
        {packages.length === 0 && !customPackage ? (
          <p className="text-body-small italic text-zinc-400">
            No packages. Create standard packages or click custom package to define one.
          </p>
        ) : (
          <>
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors space-y-1">
                <label className="flex items-center gap-2 text-body-small-s cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPkgIds.includes(pkg.id)}
                    onChange={(e) => onTogglePackage(pkg.id, e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-primary-dark focus:ring-primary-dark dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {pkg.name} - LKR {(pkg.priceInCents / 100).toLocaleString()}
                  </span>
                </label>
                {selectedPkgIds.includes(pkg.id) && (
                  <div className="ml-6 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 font-medium">Custom Deposit (LKR):</span>
                    <input
                      type="number"
                      value={packageDeposits[pkg.id] ?? ""}
                      onChange={(e) => setPackageDeposits((prev) => ({ ...prev, [pkg.id]: e.target.value }))}
                      className="w-28 h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary-dark text-zinc-700 dark:text-zinc-300"
                      placeholder="Deposit LKR"
                    />
                  </div>
                )}
              </div>
            ))}

            {customPackage && (
              <div className="p-1.5 bg-primary-dark/5 dark:bg-zinc-800 border border-primary-dark/20 dark:border-zinc-800 rounded-lg space-y-1">
                <label className="flex items-center gap-2 text-body-small-s cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomPackageSelected}
                    onChange={(e) => setIsCustomPackageSelected(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-primary-dark focus:ring-primary-dark dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <span className="text-primary-dark dark:text-primary-light font-semibold">
                    ⭐ [CUSTOM] {customPackage.name} - LKR {customPackage.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomPackage(null)}
                    className="ml-auto text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </label>
                {isCustomPackageSelected && (
                  <div className="ml-6 flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 font-medium">Custom Deposit (LKR):</span>
                    <input
                      type="number"
                      value={customPackageDeposit}
                      onChange={(e) => setCustomPackageDeposit(e.target.value)}
                      className="w-28 h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary-dark text-zinc-700 dark:text-zinc-300"
                      placeholder="Deposit LKR"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
