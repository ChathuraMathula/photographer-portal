"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { type Reservation } from "@/types";
import { usePhotographerDashboardContext } from "@/app/dashboard/context/PhotographerDashboardContext";
import { downloadInvoice } from "../../proposal-status/utils/downloadInvoice";
import { useCustomerDetails } from "../../customer-details/hooks/useCustomerDetails";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useBookingDetails(reservation: Reservation) {
  const context = usePhotographerDashboardContext();
  const paymentsUpdatedTrigger = context?.paymentsUpdatedTrigger;
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [showCashConfirm, setShowCashConfirm] = useState(false);

  const { copiedId, copiedLink, handleCopyId, handleCopyLink } = useCustomerDetails(
    reservation.id,
    reservation.reservationToken || ""
  );

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
  }, [reservation.id, reservation.status, paymentsUpdatedTrigger]);

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

  const totalPaid = payments.reduce((sum, p) => sum + p.amountInCents, 0);
  const totalAmount = reservation.totalAmountInCents || 0;
  const remainingBalance = totalAmount - totalPaid;

  return {
    copiedId,
    copiedLink,
    loadingPayments,
    fulfilling,
    showCashConfirm,
    setShowCashConfirm,
    handleCopyId,
    handleCopyLink,
    handleLogCashPayment,
    handleDownloadInvoice: () => downloadInvoice(reservation.id, API),
    totalPaid,
    totalAmount,
    remainingBalance,
  };
}
