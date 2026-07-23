import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface PaymentConfirmDetails {
  title: string;
  description: string;
  action: () => void;
}

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: PaymentConfirmDetails | null;
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  details,
}: PaymentConfirmDialogProps) {
  if (!details) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 font-bold">
            {details.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-550 dark:text-zinc-400 text-xs">
            {details.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row sm:justify-end gap-2 pt-2">
          <AlertDialogCancel className="rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs h-10 w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              details.action();
            }}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-100 font-semibold text-xs rounded-xl h-10 w-full sm:w-auto"
          >
            Proceed to Pay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
