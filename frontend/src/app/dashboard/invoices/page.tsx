"use client";

import React, { useEffect, useState } from "react";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { InvoicesListTable } from "./components/InvoicesListTable";
import { InvoiceCustomizerCard } from "./components/InvoiceCustomizerCard";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type InvoiceItem = {
  reservation: {
    id: string;
    date: string;
    eventType: string;
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  totalPaidLkr: number;
  totalValueLkr: number;
};

type InvoiceSettings = {
  invoiceTitle: string;
  invoiceColor: string;
  invoiceNotes: string;
  invoiceLogoText: string;
};

export default function InvoicesPage() {
  const context = usePhotographerDashboardContext();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  if (!context) return null;
  const { authFetch } = context;

  const loadData = async () => {
    try {
      // Load invoices list
      const invRes = await authFetch(`${API}/invoices`, { credentials: "include" });
      if (!invRes.ok) throw new Error("Failed to load invoices list");
      const invData = await invRes.json();
      setInvoices(invData);

      // Load customization settings
      const settingsRes = await authFetch(`${API}/invoices/settings`, { credentials: "include" });
      if (!settingsRes.ok) throw new Error("Failed to load invoice settings");
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

    } catch (err) {
      console.error(err);
      toast.error("Could not load invoices dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [authFetch]);

  const handleDownload = async (resId: string) => {
    try {
      const response = await fetch(`${API}/invoices/${resId}/download`, {
        headers: {
          // Include authorization credentials if needed, standard sandbox uses endpoint directly
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to download PDF invoice");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${resId.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF invoice downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF invoice. Please try again.");
    }
  };

  const handleResend = async (resId: string) => {
    setResendingId(resId);
    try {
      const res = await authFetch(`${API}/invoices/${resId}/resend`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to resend email");
      toast.success("Invoice email resent successfully to the client!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend invoice email.");
    } finally {
      setResendingId(null);
    }
  };

  const handleSaveSettings = async (updated: InvoiceSettings) => {
    const res = await authFetch(`${API}/invoices/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to update custom invoice settings.");
    }
    const data = await res.json();
    setSettings(data);
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-dark"></div>
        <p className="text-zinc-500 font-medium text-body-small">Assembling billing statement ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4 gap-4">
        <div>
          <h2 className="text-title-medium font-extrabold text-zinc-900 dark:text-white leading-none">Invoices & Statements</h2>
          <p className="text-body-caption text-zinc-400 mt-1.5">
            Manage your customer invoice statements, log off-cash payments, and customize PDF templates.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customizer sidebar */}
        <div className="lg:col-span-1">
          <InvoiceCustomizerCard settings={settings} onSave={handleSaveSettings} />
        </div>

        {/* Invoices List Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-body-base-bold font-bold text-zinc-850 dark:text-zinc-200">Generated Ledger Statements</h3>
          <InvoicesListTable
            invoices={invoices}
            onDownload={handleDownload}
            onResend={handleResend}
            resendingId={resendingId}
          />
        </div>
      </div>
    </div>
  );
}
