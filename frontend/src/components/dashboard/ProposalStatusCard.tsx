"use client";

import React, { useState, useEffect } from "react";
import { type Reservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/tracking/CountdownTimer";
import { usePhotographerDashboardContext } from "@/app/dashboard/context/PhotographerDashboardContext";
import { toast } from "sonner";
import { Download, Landmark } from "lucide-react";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function ProposalStatusCard({ reservation }: { reservation: Reservation }) {
  const isExpired = reservation.status === "PROPOSED" && reservation.paymentDeadline && new Date(reservation.paymentDeadline) < new Date();
  
  const context = usePhotographerDashboardContext();
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [showCashConfirm, setShowCashConfirm] = useState(false);

  const fetchPayments = async () => {
    if (!context || !reservation.id) return;
    setLoadingPayments(true);
    try {
      const res = await context.authFetch(`${API}/payments/${reservation.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") {
      fetchPayments();
    }
  }, [reservation.id, reservation.status]);

  const handleLogCashPayment = async () => {
    if (!context || !reservation.id) return;
    setFulfilling(true);
    try {
      const res = await context.authFetch(`${API}/payments/${reservation.id}/manual-fulfill`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Cash payment logged and invoice emailed successfully!");
        fetchPayments();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to log cash payment.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error logging cash payment.");
    } finally {
      setFulfilling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`${API}/invoices/${reservation.id}/download`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to download PDF invoice");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${reservation.id.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice PDF.");
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amountInCents, 0);
  const totalAmount = reservation.totalAmountInCents || 0;
  const remainingBalance = totalAmount - totalPaid;

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">Proposal Status Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-body-small pt-4 space-y-3">
        <p className="text-zinc-650 dark:text-zinc-400">
          <strong className="text-zinc-800 dark:text-zinc-200">Status:</strong>{" "}
          <span className={`font-semibold uppercase ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-primary-light dark:text-indigo-400'}`}>
            {isExpired ? "EXPIRED" : reservation.status}
          </span>
        </p>

        {reservation.status === "PROPOSED" && (
          <p className="text-zinc-655 dark:text-zinc-400">
            <strong className="text-zinc-800 dark:text-zinc-200">Advance Requested:</strong> LKR{" "}
            {((reservation.advancePaymentPriceInCents ?? 0) / 100).toLocaleString()}
          </p>
        )}

        {(reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") && (
          <div className="space-y-2 pt-1">
            <p className="text-zinc-655 dark:text-zinc-400">
              <strong className="text-zinc-800 dark:text-zinc-200">Total Price:</strong> LKR {(totalAmount / 100).toLocaleString()}
            </p>
            <p className="text-zinc-655 dark:text-zinc-400">
              <strong className="text-zinc-800 dark:text-zinc-200">Total Settled:</strong> LKR {(totalPaid / 100).toLocaleString()}
            </p>

            {reservation.status === "CONFIRMED" && remainingBalance > 0 && (
              <div className="bg-amber-50/50 border border-amber-200/50 p-3 rounded-xl flex items-center justify-between mt-2">
                <div>
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase">Balance Due</p>
                  <p className="font-bold text-amber-700 text-body-small-s">
                    LKR {(remainingBalance / 100).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={() => setShowCashConfirm(true)}
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
                  onClick={handleDownloadInvoice}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold h-9 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF Invoice
                </Button>
              </div>
            )}
          </div>
        )}

        {reservation.status === "PROPOSED" && reservation.paymentDeadline && (
          <div className="mt-2 space-y-2">
            <p className="text-zinc-500 dark:text-zinc-400 text-body-caption font-semibold">
              ⏰ Expiry Deadline: {new Date(reservation.paymentDeadline).toLocaleString()}
            </p>
            <CountdownTimer deadline={reservation.paymentDeadline} />
          </div>
        )}
      </CardContent>

      {/* Cash Payment Confirmation Modal */}
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
