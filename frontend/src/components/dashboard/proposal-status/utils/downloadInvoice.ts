"use client";

import { toast } from "sonner";

export async function downloadInvoice(
  reservationId: string,
  apiBaseUrl: string,
) {
  try {
    const response = await fetch(
      `${apiBaseUrl}/invoices/${reservationId}/download`,
      {
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to download PDF invoice");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${reservationId.slice(0, 8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Invoice PDF downloaded successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to download invoice PDF.");
  }
}
