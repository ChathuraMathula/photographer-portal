"use client";

import { useState } from "react";
import { copyToClipboard } from "@/utils/copyToClipboard";

export function useCustomerDetails(
  reservationId: string,
  reservationToken: string,
) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyId = async () => {
    const success = await copyToClipboard(reservationId);
    if (success) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const originUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:4000";
    const success = await copyToClipboard(
      `${originUrl}/book/track/${reservationToken}`,
    );
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return {
    copiedId,
    copiedLink,
    handleCopyId,
    handleCopyLink,
  };
}
