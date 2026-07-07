import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export function CancelReservationModal({ open, onOpenChange, onCancelConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, onCancelConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-1">
            <AlertTriangle className="h-5 w-5 text-red-650" />
          </div>
          <AlertDialogTitle className="text-title-base text-zinc-900">Cancel Reservation Request?</AlertDialogTitle>
          <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
            Are you sure you want to cancel this reservation request? This action will release the locked time slot and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <button type="button" onClick={onCancelConfirm} className="btn btn-danger btn-modal text-body-small-s h-11 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm transition-all">
            Yes, cancel
          </button>
          <button type="button" onClick={() => onOpenChange(false)} className="btn btn-outline btn-modal text-body-small-s h-11 cursor-pointer border border-zinc-200 hover:bg-zinc-50 rounded-xl font-medium transition-all">
            No
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
