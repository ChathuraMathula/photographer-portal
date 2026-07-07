"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { type Package } from "@/types";

type Props = {
  pkg: Package | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeletePackageConfirmModal({ pkg, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={!!pkg} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          {/* Icon badge */}
          <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-1">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <AlertDialogTitle className="text-title-base text-zinc-900">
            Delete package?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-zinc-800">{pkg?.name}</span>? This action cannot be undone and this package option will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <button
            id="delete-package-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="btn btn-danger btn-modal text-body-small-s h-11"
          >
            Yes, delete
          </button>
          <button
            id="delete-package-cancel-btn"
            type="button"
            onClick={onCancel}
            className="btn btn-outline btn-modal text-body-small-s h-11"
          >
            Cancel
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
