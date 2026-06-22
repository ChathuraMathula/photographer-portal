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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-title-medium text-primary-dark dark:text-white">Manage Booking Packages</h3>
          <p className="text-body-small text-zinc-500 mt-0.5">
            Add, edit, or delete standard options proposed to users.
          </p>
        </div>
        <Button
          onClick={onAddPackage}
          className="btn btn-primary h-10 px-4 py-0 min-w-0 md:min-w-0 text-sm shadow-sm gap-1"
        >
          <Plus className="h-4 w-4 shrink-0" /> Add Package
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-body-small text-zinc-400 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
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
