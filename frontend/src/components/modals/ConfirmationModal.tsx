import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, AlertCircle, Info, X, Loader2 } from "lucide-react";

type Variant = "danger" | "warning" | "default";

interface ConfirmationModalProps { title: string; description: string; confirmLabel?: string; cancelLabel?: string; variant?: Variant; loading?: boolean; onConfirm: () => void; onCancel: () => void; }

const variantConfig: Record<Variant, { icon: React.ReactNode; iconBg: string; iconColor: string; confirmClass: string; }> = {
  danger: { icon: <AlertTriangle className="h-6 w-6" />, iconBg: "bg-red-100 dark:bg-red-950/30", iconColor: "text-red-600 dark:text-red-400", confirmClass: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white border-0 shadow-sm rounded-xl" },
  warning: { icon: <AlertCircle className="h-6 w-6" />, iconBg: "bg-amber-100 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400", confirmClass: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white border-0 shadow-sm rounded-xl" },
  default: { icon: <Info className="h-6 w-6" />, iconBg: "bg-blue-100 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400", confirmClass: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white border-0 shadow-sm rounded-xl" },
};

export function ConfirmationModal({ title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "default", loading = false, onConfirm, onCancel }: ConfirmationModalProps) {
  const { icon, iconBg, iconColor, confirmClass } = variantConfig[variant];
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150" onClick={(e) => { if (e.target === e.currentTarget && !loading) onCancel(); }}>
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {!loading && <button onClick={onCancel} className="absolute top-3.5 right-3.5 h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer" aria-label="Close"><X className="h-4 w-4" /></button>}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
            <div className="pt-0.5">
              <h3 className="text-body-base-bold font-bold text-zinc-900 dark:text-white leading-tight">{title}</h3>
              <p className="text-body-small text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onConfirm} disabled={loading} className={`flex-1 h-11 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 ${confirmClass}`}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {loading ? "Processing..." : confirmLabel}
          </button>
          <button onClick={onCancel} disabled={loading} className="flex-1 h-11 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-50">{cancelLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
