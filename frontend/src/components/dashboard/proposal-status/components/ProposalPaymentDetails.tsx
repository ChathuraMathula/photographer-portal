"use client";

import React from "react";
import { type Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ProposalPaymentDetailsProps {
  reservation: Reservation;
  totalAmount: number;
  totalPaid: number;
  remainingBalance: number;
  fulfilling: boolean;
  onLogCashClick: () => void;
  onDownloadInvoice: () => void;
}

export function ProposalPaymentDetails({
  reservation,
  totalAmount,
  totalPaid,
  remainingBalance,
  fulfilling,
  onLogCashClick,
  onDownloadInvoice,
}: ProposalPaymentDetailsProps) {
  if (
    reservation.status !== "CONFIRMED" &&
    reservation.status !== "COMPLETED"
  ) {
    return null;
  }

  return (
    <div className="space-y-2 pt-1">
      <p className="text-zinc-655 dark:text-zinc-400">
        <strong className="text-zinc-800 dark:text-zinc-200">
          Advance Requested:
        </strong>{" "}
        LKR{" "}
        {((reservation.advancePaymentPriceInCents ?? 0) / 100).toLocaleString()}
      </p>
      <p className="text-zinc-655 dark:text-zinc-400">
        <strong className="text-zinc-800 dark:text-zinc-200">
          Total Price:
        </strong>{" "}
        LKR {(totalAmount / 100).toLocaleString()}
      </p>
      <p className="text-zinc-655 dark:text-zinc-400">
        <strong className="text-zinc-800 dark:text-zinc-200">
          Total Settled:
        </strong>{" "}
        LKR {(totalPaid / 100).toLocaleString()}
      </p>

      {reservation.status === "CONFIRMED" && remainingBalance > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/50 p-3 rounded-xl flex items-center justify-between mt-2">
          <div>
            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase">
              Balance Due
            </p>
            <p className="font-bold text-amber-700 text-body-small-s">
              LKR {(remainingBalance / 100).toLocaleString()}
            </p>
          </div>
          <Button
            onClick={onLogCashClick}
            disabled={fulfilling}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-8 rounded-lg cursor-pointer"
          >
            {fulfilling ? "Logging..." : "Log Cash Payment"}
          </Button>
        </div>
      )}

      {totalPaid >= (totalAmount ?? 1) && (
        <div className="pt-2">
          <Button
            onClick={onDownloadInvoice}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold h-9 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF Invoice
          </Button>
        </div>
      )}
    </div>
  );
}
