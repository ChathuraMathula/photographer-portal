"use client";

import React from "react";
import { type Reservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useProposalStatus } from "./proposal-status/hooks/useProposalStatus";
import { ProposalDetails } from "./proposal-status/components/ProposalDetails";
import { ProposalPaymentDetails } from "./proposal-status/components/ProposalPaymentDetails";

export function ProposalStatusCard({ reservation }: { reservation: Reservation }) {
  const isExpired = !!(
    reservation.status === "PROPOSED" &&
    reservation.paymentDeadline &&
    new Date(reservation.paymentDeadline) < new Date()
  );

  const {
    fulfilling,
    showCashConfirm,
    setShowCashConfirm,
    handleLogCashPayment,
    handleDownloadInvoice,
    totalPaid,
    totalAmount,
    remainingBalance,
  } = useProposalStatus(reservation);

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">
          Proposal Status Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="text-body-small pt-4 space-y-3">
        <ProposalDetails reservation={reservation} isExpired={isExpired} />
        
        <ProposalPaymentDetails
          reservation={reservation}
          totalAmount={totalAmount}
          totalPaid={totalPaid}
          remainingBalance={remainingBalance}
          fulfilling={fulfilling}
          onLogCashClick={() => setShowCashConfirm(true)}
          onDownloadInvoice={handleDownloadInvoice}
        />
      </CardContent>

      {showCashConfirm && (
        <ConfirmationModal
          title="Log Manual Cash Payment?"
          description={`You are about to log an offline cash payment of LKR ${(remainingBalance / 100).toLocaleString()}. This will mark the booking as fully settled and email the invoice to the customer.`}
          confirmLabel="Confirm Payment"
          cancelLabel="Go Back"
          variant="warning"
          loading={fulfilling}
          onConfirm={async () => {
            await handleLogCashPayment();
            setShowCashConfirm(false);
          }}
          onCancel={() => setShowCashConfirm(false)}
        />
      )}
    </Card>
  );
}
