import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DeleteUserConfirmModalProps {
  open: boolean;
  fullName: string;
  email: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserConfirmModal({
  open,
  fullName,
  email,
  loading,
  onConfirm,
  onCancel,
}: DeleteUserConfirmModalProps) {
  const [typedConfirm, setTypedConfirm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      setTypedConfirm("");
    }
  }, [open]);

  if (!open || !mounted) return null;

  const isConfirmed = typedConfirm.trim().toUpperCase() === "DELETE";

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {!loading && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-3.5 right-3.5 h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="pt-0.5 space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                Delete User Account
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Are you sure you want to permanently delete <strong>{fullName}</strong> ({email})? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label
              htmlFor="confirm-delete-input"
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block"
            >
              To confirm, type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> below:
            </label>
            <Input
              id="confirm-delete-input"
              type="text"
              placeholder="Type DELETE to confirm"
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-red-500 focus:border-red-500 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons: Cancel on LEFT, Confirm Delete on RIGHT */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-10 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || loading}
            className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
