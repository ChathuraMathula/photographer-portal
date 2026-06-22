import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PackageCard } from "./PackageCard";

type Props = {
  packages: Package[];
  onAddPackage: () => void;
  onEditPackage: (pkg: Package) => void;
  onDeletePackage: (id: string) => void;
};

export function PackageGrid({
  packages,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Manage Booking Packages</h3>
          <p className="text-xs text-zinc-500">
            Add, edit, or delete standard options proposed to users.
          </p>
        </div>
        <Button
          onClick={onAddPackage}
          className="gap-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
        >
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {packages.length === 0 ? (
          <div className="sm:col-span-3 text-center py-12 text-zinc-400 border border-dashed rounded-xl bg-white dark:bg-zinc-900">
            No active packages. Click &quot;Add Package&quot; to create your first option.
          </div>
        ) : (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={onEditPackage}
              onDelete={onDeletePackage}
            />
          ))
        )}
      </div>
    </div>
  );
}
