"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { type InvoiceItem, type InvoiceSettings } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useInvoices(
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>,
) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);   // true only on first load
  const [refreshing, setRefreshing] = useState(false); // true on search/filter re-fetches
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalSettled, setTotalSettled] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [filterDate, setFilterDate] = useState("");
  const [initialised, setInitialised] = useState(false);
  const itemsPerPage = 10;

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const invRes = await authFetch(
        `${API}/invoices?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}&sortOrder=${sortOrder}&filterDate=${filterDate}`,
        { credentials: "include" },
      );
      if (!invRes.ok) throw new Error("Failed to load invoices list");
      const invData = await invRes.json();
      setInvoices(invData.data || []);
      setTotalPages(invData.totalPages || 1);

      if (invData.kpis) {
        setTotalInvoiced(invData.kpis.totalInvoiced || 0);
        setTotalSettled(invData.kpis.totalSettled || 0);
        setOutstanding(invData.kpis.outstanding || 0);
      }

      // Only fetch settings on first load
      if (isInitial) {
        const settingsRes = await authFetch(`${API}/invoices/settings`, {
          credentials: "include",
        });
        if (!settingsRes.ok) throw new Error("Failed to load invoice settings");
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        setInitialised(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load invoices dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch, currentPage, debouncedSearch, itemsPerPage, sortBy, sortOrder, filterDate]);

  // Initial load
  useEffect(() => {
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters/page change (after initial load)
  useEffect(() => {
    if (!initialised) return;
    loadData(false);
  }, [loadData, initialised]);

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, sortBy, sortOrder]);

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
      throw new Error(
        data.message || "Failed to update custom invoice settings.",
      );
    }
    const data = await res.json();
    setSettings(data);
    toast.success("Invoice settings updated.");
  };

  return {
    invoices,
    settings,
    loading,
    refreshing,
    resendingId,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalInvoiced,
    totalSettled,
    outstanding,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterDate,
    setFilterDate,
    handleDownload,
    handleResend,
    handleSaveSettings,
  };
}
