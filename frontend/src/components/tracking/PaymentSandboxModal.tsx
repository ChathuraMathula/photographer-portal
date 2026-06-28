"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { type TrackingReservation } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type Props = {
  open: boolean;
  reservation: TrackingReservation;
  token: string;
  packageId: string;
  onSuccess: (updatedStatus: string, selectedPkgId: string) => void;
  onClose: () => void;
};

const TEST_CARDS = [
  { label: "Sampath Bank (Visa)", number: "4532 8511 2233 4455", desc: "Sri Lankan Sampath Bank Visa Success" },
  { label: "Commercial Bank (MC)", number: "5254 9622 3344 5566", desc: "Sri Lankan Commercial Bank Mastercard Success" },
  { label: "Bank of Ceylon (Visa)", number: "4005 8611 2233 4455", desc: "Sri Lankan BOC Visa Success" },
  { label: "Success (Visa Sandbox)", number: "4242 4242 4242 4242", desc: "Standard sandbox visa card" },
  { label: "Insufficient Funds", number: "4000 0000 0000 0002", desc: "Simulates card declined error" },
  { label: "Card Expired", number: "4000 0000 0000 0005", desc: "Simulates expired card rejection" },
  { label: "Suspected Fraud", number: "4000 0000 0000 0008", desc: "Simulates bank fraud guard alert" },
  { label: "Gateway Timeout", number: "5555 5555 5555 5555", desc: "Simulates 2s server timeout response" },
];

export function PaymentSandboxModal({
  open,
  reservation,
  token,
  packageId,
  onSuccess,
  onClose,
}: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [processingStep, setProcessingStep] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Determine card brand / bank dynamically
  const getSriLankanBankName = (num: string): string | null => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith("453285")) return "Sampath Bank (Visa)";
    if (clean.startsWith("543788")) return "Sampath Bank (Mastercard)";
    if (clean.startsWith("405659")) return "Commercial Bank (Visa)";
    if (clean.startsWith("525496")) return "Commercial Bank (Mastercard)";
    if (clean.startsWith("490822")) return "HNB (Visa)";
    if (clean.startsWith("510526")) return "HNB (Mastercard)";
    if (clean.startsWith("400586")) return "BOC (Visa)";
    if (clean.startsWith("549040")) return "BOC (Mastercard)";
    if (clean.startsWith("415668")) return "Seylan Bank (Visa)";
    if (clean.startsWith("520448")) return "Seylan Bank (Mastercard)";
    return null;
  };

  const lkBank = getSriLankanBankName(cardNumber);
  const cardBrand = lkBank || (cardNumber.replace(/\s+/g, "").startsWith("4")
    ? "Visa"
    : cardNumber.replace(/\s+/g, "").startsWith("5")
      ? "Mastercard"
      : "");

  // Auto-format card number as xxxx xxxx xxxx xxxx
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 16);
    const matches = rawVal.match(/.{1,4}/g);
    setCardNumber(matches ? matches.join(" ") : rawVal);
  };

  // Auto-format expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (rawVal.length >= 2) {
      setExpiryDate(`${rawVal.slice(0, 2)}/${rawVal.slice(2)}`);
    } else {
      setExpiryDate(rawVal);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
  };

  const fillTestCard = (number: string) => {
    setCardNumber(number);
    setExpiryDate("12/28");
    setCvv("123");
    setCardholderName("John Doe");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast.error("Please fill in all card details.");
      return;
    }

    setPaymentStatus("processing");
    setErrorMsg("");

    // Simulate standard transaction step animations for sandbox realism
    setProcessingStep("Securing connection to bank...");
    await new Promise((resolve) => setTimeout(resolve, 800));

    setProcessingStep("Verifying card parameters...");
    await new Promise((resolve) => setTimeout(resolve, 800));

    setProcessingStep("Authorizing deposit funds...");

    try {
      const res = await fetch(`${API}/payments/charge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || "",
          email: localStorage.getItem(`verified_email_res_${token}`) || "",
          packageId,
          cardNumber,
          expiryDate,
          cvv,
          cardholderName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Payment authorization failed");
      }

      const isBalancePayment = reservation.status === "CONFIRMED";
      setPaymentStatus("success");
      setProcessingStep(isBalancePayment ? "Payment approved! Balance settled." : "Payment approved! Booking confirmed.");
      toast.success(isBalancePayment ? "Remaining balance paid successfully!" : "Deposit paid and slot confirmed!");

      // Wait briefly for checkmark success animations, then confirm success state
      setTimeout(() => {
        onSuccess("CONFIRMED", packageId);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Card transaction failed");
      setPaymentStatus("error");
      toast.error(err.message || "Payment declined");
    }
  };

  // Reset state on modal close/open
  useEffect(() => {
    if (open) {
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardholderName("");
      setPaymentStatus("idle");
      setErrorMsg("");
      setProcessingStep("");
    }
  }, [open]);

  const getDepositAmountInCents = () => {
    if (!packageId || !reservation.selectedPackages) {
      return reservation.advancePaymentPriceInCents ?? 0;
    }
    const pkg = reservation.selectedPackages.find((p: any) => p.id === packageId);
    if (!pkg) return reservation.advancePaymentPriceInCents ?? 0;
    if (pkg.customDepositAmountInCents !== undefined && pkg.customDepositAmountInCents !== null) {
      return pkg.customDepositAmountInCents;
    }
    if (pkg.depositType === "fixed") {
      return pkg.depositValue ?? 0;
    }
    if (pkg.depositType === "percentage") {
      return Math.round((pkg.priceInCents * (pkg.depositValue ?? 0)) / 100);
    }
    return reservation.advancePaymentPriceInCents ?? 0;
  };

  const isBalancePayment = reservation.status === "CONFIRMED";
  const getChargeAmountInCents = () => {
    if (isBalancePayment) {
      return (reservation.totalAmountInCents ?? 0) - (reservation.totalPaidInCents ?? 0);
    }
    return getDepositAmountInCents();
  };
  const chargeLkr = getChargeAmountInCents() / 100;

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && paymentStatus !== "processing" && onClose()}>
      <AlertDialogContent className="max-w-md w-full overflow-hidden p-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <AlertDialogTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white">
              Secure Sandbox Checkout
            </AlertDialogTitle>
          </div>
          {paymentStatus !== "processing" && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {paymentStatus === "processing" || paymentStatus === "success" ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[350px] space-y-4 text-center shrink-0">
            {paymentStatus === "processing" ? (
              <>
                <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-500 animate-spin" />
                <p className="font-semibold text-zinc-900 dark:text-white text-body-base mt-2">
                  {processingStep}
                </p>
                <p className="text-xs text-zinc-400">Do not refresh or close this window.</p>
              </>
            ) : (
              <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center space-y-3">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-500 animate-bounce" />
                <p className="font-bold text-zinc-900 dark:text-white text-title-base">
                  Payment Confirmed!
                </p>
                <p className="text-body-small text-zinc-500 dark:text-zinc-400">
                  {isBalancePayment ? "Your remaining balance is settled." : "Your reservation slot is locked. Redirecting..."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
            {/* Summary Details */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-zinc-400 font-semibold">{isBalancePayment ? "Remaining Balance" : "Advance Payment Deposit"}</p>
                <p className="font-bold text-title-medium text-zinc-900 dark:text-white mt-0.5">
                  LKR {chargeLkr.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 font-semibold">Shoot Date</p>
                <p className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {new Date(reservation.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-body-small text-center font-medium animate-in fade-in">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Sandbox Quick-Fill Simulator */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Sandbox Quick Fill Test Cards
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {TEST_CARDS.map((card) => (
                  <button
                    key={card.number}
                    type="button"
                    onClick={() => fillTestCard(card.number)}
                    className="flex flex-col text-left p-2.5 rounded-lg border border-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-zinc-50/30 hover:bg-zinc-50 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/50 cursor-pointer transition-all"
                  >
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-205">{card.label}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 font-mono">{card.number}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-650 dark:text-zinc-300 uppercase tracking-wide">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full h-11 px-3 text-body-small bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark dark:focus:ring-zinc-700 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-650 dark:text-zinc-300 uppercase tracking-wide flex justify-between">
                  <span>Card Number</span>
                  {cardBrand && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                      {cardBrand}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full h-11 pl-10 pr-3 text-body-small bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark dark:focus:ring-zinc-700 focus:border-transparent transition-all font-mono"
                  />
                  <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 shrink-0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-300 uppercase tracking-wide">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className="w-full h-11 px-3 text-body-small bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark dark:focus:ring-zinc-700 focus:border-transparent transition-all font-mono text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-300 uppercase tracking-wide">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="w-full h-11 px-3 text-body-small bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark dark:focus:ring-zinc-700 focus:border-transparent transition-all font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 mt-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-1.5 shadow-md text-body-small-s"
              >
                Pay LKR {chargeLkr.toLocaleString()} &amp; {isBalancePayment ? "Settle Balance" : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
