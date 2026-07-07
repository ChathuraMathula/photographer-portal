"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function LogoutConfirmModal({ open, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          {/* Icon badge */}
          <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-1">
            <LogOut className="h-5 w-5 text-red-600" />
          </div>
          <AlertDialogTitle className="text-title-base text-zinc-900">
            Log out of Photographer Portal?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
            You&apos;ll be returned to the login screen. Any unsaved changes
            will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Confirm LEFT · Cancel RIGHT — intentional order to prevent accidental logout */}
        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <button
            id="logout-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="btn btn-danger btn-modal text-body-small-s h-11"
          >
            Yes, log out
          </button>
          <button
            id="logout-cancel-btn"
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
