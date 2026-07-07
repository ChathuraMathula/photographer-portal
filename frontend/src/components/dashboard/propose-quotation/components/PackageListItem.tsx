import { type Package } from "@/types";

type Props = {
  pkg: Package;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  depositValue: string;
  onDepositChange: (v: string) => void;
};

export function PackageListItem({ pkg, isSelected, onToggle, depositValue, onDepositChange }: Props) {
  return (
    <div className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors space-y-1">
      <label className="flex items-center gap-2 text-body-small-s cursor-pointer">
        <input type="checkbox" checked={isSelected} onChange={(e) => onToggle(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-primary-dark focus:ring-primary-dark dark:border-zinc-700 dark:bg-zinc-950" />
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{pkg.name} - LKR {(pkg.priceInCents / 100).toLocaleString()}</span>
      </label>
      {isSelected && (
        <div className="ml-6 flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-medium">Custom Deposit (LKR):</span>
          <input type="number" value={depositValue} onChange={(e) => onDepositChange(e.target.value)} className="w-28 h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary-dark text-zinc-700 dark:text-zinc-300" placeholder="Deposit LKR" />
        </div>
      )}
    </div>
  );
}
