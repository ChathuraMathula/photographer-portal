"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AcceptBookingsConfirmModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="h-11 w-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-1">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <AlertDialogTitle className="text-title-base text-zinc-900">
            Pause Booking Requests?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
            Prospective clients will not be able to submit booking requests, but
            they can still see your profile details and your offline status
            message.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <button
            id="toggle-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="btn btn-danger btn-modal text-body-small-s h-11 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm transition-all"
          >
            Yes, pause
          </button>
          <button
            id="toggle-cancel-btn"
            type="button"
            onClick={onCancel}
            className="btn btn-outline btn-modal text-body-small-s h-11 cursor-pointer border border-zinc-200 hover:bg-zinc-50 rounded-xl font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
