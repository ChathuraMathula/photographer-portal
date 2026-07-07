"use client";

import React from "react";
import { type Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CountdownTimer } from "@/components/tracking/CountdownTimer";

interface Props {
  reservation: Reservation;
  totalPaid: number;
  totalAmount: number;
  remainingBalance: number;
  fulfilling: boolean;
  onLogCash: () => void;
  onDownloadInvoice: () => void;
}

export function BookingDetailsPayments({
  reservation,
  totalPaid,
  totalAmount,
  remainingBalance,
  fulfilling,
  onLogCash,
  onDownloadInvoice,
}: Props) {
  const selectedPkg = reservation.clientSelectedPackageId && reservation.selectedPackages
    ? reservation.selectedPackages.find(p => p.id === reservation.clientSelectedPackageId)
    : null;

  return (
    <div className="space-y-3 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
      <h3 className="text-body-base-bold text-primary-dark dark:text-white font-semibold">Proposal &amp; Package Details</h3>
      {reservation.status === "PROPOSED" && reservation.paymentDeadline && <CountdownTimer deadline={reservation.paymentDeadline} />}
      <div className="space-y-2 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-left">
        {selectedPkg && (
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Selected Option</p>
            <p className="text-body-small-s font-semibold text-primary-dark dark:text-white">{selectedPkg.name}</p>
          </div>
        )}
        {!reservation.clientSelectedPackageId && reservation.selectedPackages && reservation.selectedPackages.length > 0 && (
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Proposed Packages</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-body-small-s text-zinc-700 dark:text-zinc-300">
              {reservation.selectedPackages.map((pkg) => <li key={pkg.id}><strong>{pkg.name}</strong> – LKR {(pkg.priceInCents / 100).toLocaleString()}</li>)}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
          {reservation.totalAmountInCents && (
            <div>
              <p className="text-body-caption font-semibold text-zinc-400">Total Price</p>
              <p className="text-body-small-s font-bold text-zinc-950 dark:text-white">LKR {(totalAmount / 100).toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Total Paid</p>
            <p className="text-body-small-s font-bold text-emerald-600 dark:text-emerald-500">LKR {(totalPaid / 100).toLocaleString()}</p>
          </div>
        </div>
        {reservation.status === "CONFIRMED" && remainingBalance > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2 flex justify-between items-center">
            <div>
              <p className="text-body-caption font-semibold text-zinc-400">Remaining Balance</p>
              <p className="text-body-small-s font-bold text-amber-600">LKR {(remainingBalance / 100).toLocaleString()}</p>
            </div>
            <Button onClick={onLogCash} disabled={fulfilling} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-8 rounded-lg cursor-pointer">{fulfilling ? "Logging..." : "Log Cash Payment"}</Button>
          </div>
        )}
        {totalPaid >= (totalAmount ?? 1) && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
            <Button onClick={onDownloadInvoice} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold h-9 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"><Download className="h-3.5 w-3.5" /> Download PDF Invoice</Button>
          </div>
        )}
        {reservation.quotationNotes && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
            <p className="text-body-caption font-semibold text-zinc-400">Quotation Notes</p>
            <p className="text-body-small-s italic text-zinc-550 dark:text-zinc-400">"{reservation.quotationNotes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
