import { Endpoint } from "../types";

type MethodBadgeProps = {
  method: Endpoint["method"];
};

export function MethodBadge({ method }: MethodBadgeProps) {
  const styles = {
    GET: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    POST: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
    PATCH:
      "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    DELETE:
      "bg-red-50 text-red-705 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono select-none ${styles[method]}`}
    >
      {method}
    </span>
  );
}
