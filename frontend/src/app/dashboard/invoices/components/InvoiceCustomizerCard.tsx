"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Receipt } from "lucide-react";
import { toast } from "sonner";

type InvoiceSettings = {
  invoiceTitle: string;
  invoiceColor: string;
  invoiceNotes: string;
  invoiceLogoText: string;
  invoicePhone: string;
  invoiceTaxRate: number;
  invoiceInstructions: string;
};

type InvoiceCustomizerCardProps = {
  settings: InvoiceSettings;
  onSave: (updated: InvoiceSettings) => Promise<void>;
};

export function InvoiceCustomizerCard({
  settings,
  onSave,
}: InvoiceCustomizerCardProps) {
  const [invoiceTitle, setInvoiceTitle] = useState(settings.invoiceTitle || "INVOICE");
  const [invoiceColor, setInvoiceColor] = useState(settings.invoiceColor || "#2563eb");
  const [invoiceNotes, setInvoiceNotes] = useState(settings.invoiceNotes || "");
  const [invoiceLogoText, setInvoiceLogoText] = useState(settings.invoiceLogoText || "");
  const [invoicePhone, setInvoicePhone] = useState(settings.invoicePhone || "");
  const [invoiceTaxRate, setInvoiceTaxRate] = useState(settings.invoiceTaxRate || 0);
  const [invoiceInstructions, setInvoiceInstructions] = useState(settings.invoiceInstructions || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInvoiceTitle(settings.invoiceTitle || "INVOICE");
    setInvoiceColor(settings.invoiceColor || "#2563eb");
    setInvoiceNotes(settings.invoiceNotes || "");
    setInvoiceLogoText(settings.invoiceLogoText || "");
    setInvoicePhone(settings.invoicePhone || "");
    setInvoiceTaxRate(settings.invoiceTaxRate || 0);
    setInvoiceInstructions(settings.invoiceInstructions || "");
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        invoiceTitle,
        invoiceColor,
        invoiceNotes,
        invoiceLogoText,
        invoicePhone,
        invoiceTaxRate: Number(invoiceTaxRate),
        invoiceInstructions,
      });
      toast.success("Invoice settings updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update custom invoice settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Palette className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          Invoice Customizer
        </CardTitle>
        <CardDescription className="text-xs">
          Personalize the design and terms of your system-generated PDFs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* Invoice Header Title */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">Header Document Title</label>
            <input
              type="text"
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
              className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. INVOICE, BILLING STATEMENT"
              required
            />
          </div>

          {/* Branding Studio Name */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">Branding Logo Text (Studio Name)</label>
            <input
              type="text"
              value={invoiceLogoText}
              onChange={(e) => setInvoiceLogoText(e.target.value)}
              className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Elite Photography Studio"
            />
          </div>

          {/* Studio Phone Number */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">Business Contact Phone</label>
            <input
              type="text"
              value={invoicePhone}
              onChange={(e) => setInvoicePhone(e.target.value)}
              className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. +94 77 123 4567"
            />
          </div>

          {/* Tax / VAT Percentage */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">VAT / Tax Percentage Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={invoiceTaxRate}
              onChange={(e) => setInvoiceTaxRate(Number(e.target.value))}
              className="w-full h-10 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 5 for 5% tax"
            />
          </div>

          {/* Theme Accent Color */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">Invoice Accent Theme Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={invoiceColor}
                onChange={(e) => setInvoiceColor(e.target.value)}
                className="h-10 w-16 p-0 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent cursor-pointer overflow-hidden"
              />
              <span className="font-mono text-[11px] text-zinc-500">{invoiceColor.toUpperCase()}</span>
            </div>
          </div>

          {/* Fulfillment Instructions & Next Steps */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">Fulfillment Instructions (Next Steps)</label>
            <textarea
              value={invoiceInstructions}
              onChange={(e) => setInvoiceInstructions(e.target.value)}
              rows={3}
              className="w-full p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="e.g. To proceed, please coordinate shoot times. Bank account info: Sampath Bank..."
            />
          </div>

          {/* Custom Footer Notes */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-zinc-550 block">Custom Footer Notes & Terms</label>
            <textarea
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="e.g. Thank you for your business!"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={saving}
            className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            <Palette className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save PDF Preferences"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
