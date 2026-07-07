"use client";

import { useState } from "react";

export function useCustomerDetails(
  reservationId: string,
  reservationToken: string,
) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(reservationId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const originUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:4000";
      await navigator.clipboard.writeText(
        `${originUrl}/book/track/${reservationToken}`,
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    copiedId,
    copiedLink,
    handleCopyId,
    handleCopyLink,
  };
}
