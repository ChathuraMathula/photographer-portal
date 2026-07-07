import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";

type Props = {
  customPackage: CustomPackageValues;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  onRemove: () => void;
  depositValue: string;
  onDepositChange: (v: string) => void;
};

export function CustomPackageListItem({ customPackage, isSelected, onToggle, onRemove, depositValue, onDepositChange }: Props) {
  return (
    <div className="p-1.5 bg-primary-dark/5 dark:bg-zinc-800 border border-primary-dark/20 dark:border-zinc-800 rounded-lg space-y-1">
      <label className="flex items-center gap-2 text-body-small-s cursor-pointer">
        <input type="checkbox" checked={isSelected} onChange={(e) => onToggle(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-primary-dark focus:ring-primary-dark dark:border-zinc-700 dark:bg-zinc-950" />
        <span className="text-primary-dark dark:text-primary-light font-semibold">⭐ [CUSTOM] {customPackage.name} - LKR {customPackage.price.toLocaleString()}</span>
        <button type="button" onClick={onRemove} className="ml-auto text-xs text-red-500 hover:underline cursor-pointer">Remove</button>
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
