"use client";
import React from "react";
import { CreditCard } from "lucide-react";

type CardFormFieldsProps = {
  cardNumber: string;
  setCardNumber: (num: string) => void;
  expiryDate: string;
  setExpiryDate: (expiry: string) => void;
  cvv: string;
  setCvv: (cvv: string) => void;
  cardholderName: string;
  setCardholderName: (name: string) => void;
  cardBrand: string | null;
};

export function CardFormFields({
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  cardholderName,
  setCardholderName,
  cardBrand,
}: CardFormFieldsProps) {
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 16);
    const matches = rawVal.match(/.{1,4}/g);
    setCardNumber(matches ? matches.join(" ") : rawVal);
  };
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 4);
    setExpiryDate(
      rawVal.length >= 2 ? `${rawVal.slice(0, 2)}/${rawVal.slice(2)}` : rawVal,
    );
  };
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));

  return (
    <div className="space-y-4">
      <div className="space-y-1.5 text-left">
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
      <div className="space-y-1.5 text-left">
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
        <div className="space-y-1.5 text-left">
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
        <div className="space-y-1.5 text-left">
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
    </div>
  );
}
