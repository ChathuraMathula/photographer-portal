"use client";
import React from "react";
import { ShieldCheck, X, CheckCircle2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type TrackingReservation } from "@/types";
import { TestCardsGrid } from "@/components/tracking/components/TestCardsGrid";
import { CardFormFields } from "@/components/tracking/components/CardFormFields";
import { usePaymentSandbox } from "./hooks/usePaymentSandbox";

export function PaymentSandboxModal({ open, reservation, token, packageId, onSuccess, onClose }: { open: boolean, reservation: TrackingReservation, token: string, packageId: string, onSuccess: (s: string, p: string) => void, onClose: () => void }) {
  const { cardNumber, setCardNumber, expiryDate, setExpiryDate, cvv, setCvv, cardholderName, setCardholderName, paymentStatus, processingStep, errorMsg, cardBrand, fillTestCard, handleSubmit, chargeLkr, isBalancePayment } = usePaymentSandbox(open, reservation, token, packageId, onSuccess, onClose);

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && paymentStatus !== "processing" && onClose()}>
      <AlertDialogContent className="max-w-md w-full overflow-hidden p-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /><AlertDialogTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">Secure Sandbox Checkout</AlertDialogTitle></div>
          {paymentStatus !== "processing" && <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="h-4 w-4" /></button>}
        </div>
        {paymentStatus === "processing" || paymentStatus === "success" ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[350px] space-y-4 text-center shrink-0">
            {paymentStatus === "processing" ? (
              <><Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-500 animate-spin" /><p className="font-semibold text-zinc-900 dark:text-white text-body-base mt-2">{processingStep}</p><p className="text-xs text-zinc-400">Do not refresh or close this window.</p></>
            ) : (
              <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center space-y-3"><CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-500 animate-bounce" /><p className="font-bold text-zinc-900 dark:text-white text-title-base">Payment Confirmed!</p><p className="text-body-small text-zinc-500 dark:text-zinc-400">{isBalancePayment ? "Your remaining balance is settled." : "Your reservation slot is locked. Redirecting..."}</p></div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div><p className="text-xs text-zinc-400 font-semibold">{isBalancePayment ? "Remaining Balance" : "Advance Payment Deposit"}</p><p className="font-bold text-title-medium text-zinc-900 dark:text-white mt-0.5">LKR {chargeLkr.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-xs text-zinc-400 font-semibold">Shoot Date</p><p className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{new Date(reservation.date).toLocaleDateString()}</p></div>
            </div>
            {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-body-small text-center font-medium animate-in fade-in">⚠️ {errorMsg}</div>}
            <TestCardsGrid onSelect={fillTestCard} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <CardFormFields cardNumber={cardNumber} setCardNumber={setCardNumber} expiryDate={expiryDate} setExpiryDate={setExpiryDate} cvv={cvv} setCvv={setCvv} cardholderName={cardholderName} setCardholderName={setCardholderName} cardBrand={cardBrand} />
              <button type="submit" className="w-full h-12 mt-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-1.5 shadow-md text-body-small-s">
                Pay LKR {chargeLkr.toLocaleString()} &amp; {isBalancePayment ? "Settle Balance" : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
