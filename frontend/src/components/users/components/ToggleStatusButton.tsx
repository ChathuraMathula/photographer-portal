import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type Props = {
  isActive: boolean;
  isSelf: boolean;
  onClick: () => void;
};

export function ToggleStatusButton({ isActive, isSelf, onClick }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isSelf}
      className={`btn btn-secondary h-8 px-3 py-0 min-w-0 md:min-w-0 text-body-caption shadow-none gap-1 border ${
        isSelf
          ? "opacity-50 cursor-not-allowed text-zinc-400 bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
          : isActive
            ? "text-emerald-700 border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-950/30 dark:bg-emerald-950/10"
            : "text-zinc-555 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700"
      }`}
    >
      {isActive ? (
        <>
          <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Active
        </>
      ) : (
        <>
          <XCircle className="h-3.5 w-3.5 shrink-0" /> Suspended
        </>
      )}
    </Button>
  );
}
