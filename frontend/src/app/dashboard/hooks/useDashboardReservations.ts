"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { type Reservation, type Package } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface UseDashboardReservationsProps {
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  loadPhotographerData: () => Promise<void>;
  packages: Package[];
  universalDepositType: string;
  universalDepositValue: number;
}

export function useDashboardReservations({
  authFetch,
  loadPhotographerData,
  packages,
  universalDepositType,
  universalDepositValue,
}: UseDashboardReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Proposal / rejection form states
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [quotationNotes, setQuotationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [packageDeposits, setPackageDeposits] = useState<Record<string, string>>({});

  const selectReservation = (res: Reservation | null) => {
    setSelectedRes(res);
    if (res) {
      const key = `chat_last_viewed_photographer_${res.id}`;
      localStorage.setItem(key, new Date().toISOString());
      // Force trigger state update to re-render the list items
      setReservations((prev) => [...prev]);
    }
  };

  // Automatically calculate default deposits and update packageDeposits when selectedPkgIds changes
  useEffect(() => {
    setPackageDeposits((prev) => {
      const updated = { ...prev };
      // Remove any that are no longer selected
      Object.keys(updated).forEach((id) => {
        if (!selectedPkgIds.includes(id)) {
          delete updated[id];
        }
      });
      // Add defaults for new selections
      selectedPkgIds.forEach((id) => {
        if (updated[id] === undefined) {
          const selected = packages.find((p) => p.id === id);
          if (selected) {
            let depositLkr = 0;
            const depType = selected.depositType || "universal";
            if (depType === "fixed") {
              depositLkr = (selected.depositValue ?? 0) / 100;
            } else if (depType === "percentage") {
              depositLkr = ((selected.priceInCents / 100) * (selected.depositValue ?? 0)) / 100;
            } else {
              if (universalDepositType === "fixed") {
                depositLkr = universalDepositValue;
              } else {
                depositLkr = ((selected.priceInCents / 100) * universalDepositValue) / 100;
              }
            }
            updated[id] = String(Math.round(depositLkr));
          }
        }
      });
      return updated;
    });
  }, [selectedPkgIds, packages, universalDepositType, universalDepositValue]);

  const handleProposeQuotation = async () => {
    if (!selectedRes || selectedPkgIds.length === 0) return;
    try {
      const centsDeposits: Record<string, number> = {};
      Object.entries(packageDeposits).forEach(([pkgId, val]) => {
        const numVal = Number(val);
        if (!isNaN(numVal)) {
          centsDeposits[pkgId] = Math.round(numVal * 100);
        }
      });

      const res = await authFetch(`${API}/reservations/${selectedRes.id}/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageIds: selectedPkgIds,
          advancePaymentPriceInCents: 0,
          quotationNotes,
          packageDeposits: centsDeposits,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to propose packages");
      setSelectedPkgIds([]);
      setQuotationNotes("");
      await loadPhotographerData();
      setSelectedRes(null);
      toast.success("Proposal sent successfully to customer email!");
    } catch (err: any) {
      toast.error(err.message || "Error sending proposal");
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRes || !rejectionReason.trim()) return;
    try {
      const res = await authFetch(`${API}/reservations/${selectedRes.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject");
      setRejectionReason("");
      setShowRejectForm(false);
      await loadPhotographerData();
      setSelectedRes(null);
      toast.success("Request rejected professionally.");
    } catch (err: any) {
      toast.error(err.message || "Error rejecting request");
    }
  };

  return {
    reservations,
    setReservations,
    selectedRes,
    setSelectedRes,
    selectReservation,
    selectedPkgIds,
    setSelectedPkgIds,
    quotationNotes,
    setQuotationNotes,
    rejectionReason,
    setRejectionReason,
    showRejectForm,
    setShowRejectForm,
    packageDeposits,
    setPackageDeposits,
    handleProposeQuotation,
    handleRejectRequest,
  };
}
