import React from "react";
import { CheckCircle2, Ban } from "lucide-react";

type Props = {
  isActive: boolean;
  isSelf: boolean;
  onClick: () => void;
};

export function ToggleStatusButton({ isActive, isSelf, onClick }: Props) {
  if (isSelf) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
        isActive
          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40"
          : "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-950/80 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40"
      }`}
      title={isActive ? "Click to Suspend Account" : "Click to Reactivate Account"}
    >
      {isActive ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Active</span>
        </>
      ) : (
        <>
          <Ban className="h-3.5 w-3.5 shrink-0" />
          <span>Suspended</span>
        </>
      )}
    </button>
  );
}
