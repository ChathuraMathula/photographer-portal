"use client";

import React from "react";
import { type Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useBookingDetails } from "@/components/modals/booking-details/hooks/useBookingDetails";
import { BookingDetailsHeader } from "@/components/modals/booking-details/components/BookingDetailsHeader";
import { BookingDetailsMeta } from "@/components/modals/booking-details/components/BookingDetailsMeta";
import { BookingDetailsLocation } from "@/components/modals/booking-details/components/BookingDetailsLocation";
import { BookingDetailsPayments } from "@/components/modals/booking-details/components/BookingDetailsPayments";

type Props = {
  reservation: Reservation;
  onClose: () => void;
  onNavigateToReservation: (res: Reservation) => void;
};

export function BookingDetailsModal({ reservation, onClose, onNavigateToReservation }: Props) {
  const state = useBookingDetails(reservation);
  const showPay = (reservation.selectedPackages && reservation.selectedPackages.length > 0) || reservation.totalAmountInCents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <BookingDetailsHeader reservation={reservation} onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left">
          <BookingDetailsMeta reservation={reservation} copiedId={state.copiedId} copiedLink={state.copiedLink} handleCopyId={state.handleCopyId} handleCopyLink={state.handleCopyLink} />
          <BookingDetailsLocation reservation={reservation} />

          {reservation.customerNotes && (
            <div className="space-y-1.5 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <p className="text-body-caption font-semibold text-zinc-400">Client Notes</p>
              <p className="text-body-small italic text-zinc-650 dark:text-zinc-350 bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80">"{reservation.customerNotes}"</p>
            </div>
          )}

          {showPay && (
            <BookingDetailsPayments
              reservation={reservation}
              totalPaid={state.totalPaid}
              totalAmount={state.totalAmount}
              remainingBalance={state.remainingBalance}
              fulfilling={state.fulfilling}
              onLogCash={() => state.setShowCashConfirm(true)}
              onDownloadInvoice={state.handleDownloadInvoice}
            />
          )}

          {reservation.rejectionReason && (
            <div className="space-y-1.5 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <p className="text-body-caption font-semibold text-zinc-400">Rejection Reason</p>
              <p className="text-body-small text-red-650 dark:text-red-400 bg-red-50/30 dark:bg-red-950/10 p-3 rounded-xl border border-red-100/55 dark:border-red-900/35 italic">"{reservation.rejectionReason}"</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="btn btn-secondary btn-modal h-11 px-6 text-body-small-s cursor-pointer">Close Dialog</Button>
          <Button type="button" onClick={() => onNavigateToReservation(reservation)} className="btn btn-primary btn-modal h-11 px-6 text-body-small-s shadow-sm font-semibold cursor-pointer">View Reservation</Button>
        </div>
      </div>

      {state.showCashConfirm && (
        <ConfirmationModal
          title="Log Manual Cash Payment?"
          description={`You are about to log an offline cash payment of LKR ${(state.remainingBalance / 100).toLocaleString()}. This will mark the booking as fully settled and email the invoice to the customer.`}
          confirmLabel="Confirm Payment"
          cancelLabel="Go Back"
          variant="warning"
          loading={state.fulfilling}
          onConfirm={async () => { await state.handleLogCashPayment(); state.setShowCashConfirm(false); }}
          onCancel={() => state.setShowCashConfirm(false)}
        />
      )}
    </div>
  );
}
