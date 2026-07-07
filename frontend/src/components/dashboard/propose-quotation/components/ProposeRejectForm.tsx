import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onCancelReject: () => void;
  onReject: () => void;
  showRejectConfirm: boolean;
  setShowRejectConfirm: (show: boolean) => void;
};

export function ProposeRejectForm({
  rejectionReason,
  onRejectionReasonChange,
  onCancelReject,
  onReject,
  showRejectConfirm,
  setShowRejectConfirm,
}: Props) {
  return (
    <>
      <div className="w-full space-y-3">
        <Input
          placeholder="Polite reason for rejection..."
          value={rejectionReason}
          onChange={(e) => onRejectionReasonChange(e.target.value)}
          className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={onCancelReject}
            className="btn btn-secondary h-9 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s shadow-sm"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowRejectConfirm(true)}
            disabled={!rejectionReason.trim()}
            className="btn h-9 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s bg-destructive text-white hover:bg-destructive/90 border border-destructive shadow-sm"
          >
            Confirm Reject
          </Button>
        </div>
      </div>
      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-1">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-title-base text-zinc-900">
              Reject Reservation Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
              Are you sure you want to reject this reservation request? This
              action will cancel the request and notify the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowRejectConfirm(false);
                onReject();
              }}
              className="btn btn-danger btn-modal text-body-small-s h-11 cursor-pointer bg-red-650 hover:bg-red-750 text-white rounded-xl font-medium shadow-sm transition-all"
            >
              Yes, reject
            </button>
            <button
              type="button"
              onClick={() => setShowRejectConfirm(false)}
              className="btn btn-outline btn-modal text-body-small-s h-11 cursor-pointer border border-zinc-200 hover:bg-zinc-50 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
