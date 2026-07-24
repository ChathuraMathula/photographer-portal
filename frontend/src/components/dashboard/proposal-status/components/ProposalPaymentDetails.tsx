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

  const selectedPkg =
    reservation.selectedPackages && reservation.selectedPackages.length > 0
      ? (reservation.clientSelectedPackageId
          ? reservation.selectedPackages.find(
              (p) => p.id === reservation.clientSelectedPackageId,
            )
          : null) || reservation.selectedPackages[0]
      : null;

  return (
    <div className="space-y-3 pt-1">
      {selectedPkg && (
        <div className="bg-zinc-50/80 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 my-2 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Selected Package
            </span>
            {(selectedPkg.isCustom || selectedPkg.id?.startsWith("custom_")) && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-md">
                Custom Package
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-body-small-s font-bold text-zinc-900 dark:text-white">
              {selectedPkg.name}
            </h4>
            <span className="text-body-small-s font-bold text-primary-dark dark:text-indigo-400">
              LKR {(selectedPkg.priceInCents / 100).toLocaleString()}{" "}
              {selectedPkg.durationHours > 0 && (
                <span className="text-zinc-500 dark:text-zinc-400 font-normal text-[11px]">
                  ({selectedPkg.durationHours} hrs)
                </span>
              )}
            </span>
          </div>

          {selectedPkg.description && (
            <p className="text-body-caption text-zinc-650 dark:text-zinc-400 italic">
              {selectedPkg.description}
            </p>
          )}

          {selectedPkg.includes && selectedPkg.includes.length > 0 && (
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-2">
              <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Included Deliverables &amp; Services:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-650 dark:text-zinc-400">
                {selectedPkg.includes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
