"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { type InvoiceItem, type InvoiceSettings } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useInvoices(authFetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalSettled, setTotalSettled] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const invRes = await authFetch(`${API}/invoices?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`, { credentials: "include" });
      if (!invRes.ok) throw new Error("Failed to load invoices list");
      const invData = await invRes.json();
      setInvoices(invData.data || []);
      setTotalPages(invData.totalPages || 1);
      
      if (invData.kpis) {
        setTotalInvoiced(invData.kpis.totalInvoiced || 0);
        setTotalSettled(invData.kpis.totalSettled || 0);
        setOutstanding(invData.kpis.outstanding || 0);
      }

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
  }, [authFetch, currentPage, searchTerm, itemsPerPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDownload = async (resId: string) => {
    try {
      const response = await fetch(`${API}/invoices/${resId}/download`, {
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
    toast.success("Invoice settings updated.");
  };

  return {
    invoices,
    settings,
    loading,
    resendingId,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalInvoiced,
    totalSettled,
    outstanding,
    handleDownload,
    handleResend,
    handleSaveSettings,
  };
}
