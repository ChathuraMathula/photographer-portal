import { type Package } from "@/types";

type Props = {
  pkg: Package;
  isSelected: boolean;
  isConfirmed: boolean;
  isMySelection: boolean;
  onSelect: (id: string) => void;
};

export function ProposalPackageCard({
  pkg,
  isSelected,
  isConfirmed,
  isMySelection,
  onSelect,
}: Props) {
  const borderClass = isConfirmed
    ? isMySelection
      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-default"
      : "border-zinc-200 dark:border-zinc-800 opacity-60 pointer-events-none"
    : isSelected
    ? "border-primary-dark bg-zinc-50/50 dark:border-white dark:bg-zinc-900 cursor-pointer shadow-md"
    : "border-zinc-200 hover:border-primary-light dark:border-zinc-800 cursor-pointer";

  return (
    <div
      onClick={() => !isConfirmed && onSelect(pkg.id)}
      className={`group relative flex flex-col justify-between p-5 rounded-xl border transition-all ${borderClass}`}
    >
      <div>
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-body-base-bold text-zinc-950 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
            {pkg.name}
          </h4>
          {isMySelection && (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-body-caption font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
              Selected
            </span>
          )}
        </div>
        {pkg.description && (
          <p className="text-body-small-s text-zinc-500 mt-1.5 line-clamp-3 leading-relaxed">
            {pkg.description}
          </p>
        )}
        <p className="text-body-caption text-zinc-400 mt-2">
          Duration: {pkg.durationHours} hr(s)
        </p>
        {pkg.includes.length > 0 && (
          <ul className="text-body-caption text-zinc-500 space-y-1 mt-3 pl-4 list-disc">
            {pkg.includes.slice(0, 3).map((inc) => (
              <li key={inc}>{inc}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-4 flex items-baseline gap-1">
        <span className="text-body-caption font-semibold text-zinc-400">LKR</span>
        <span className="text-title-base text-zinc-950 dark:text-white">
          {(pkg.priceInCents / 100).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
