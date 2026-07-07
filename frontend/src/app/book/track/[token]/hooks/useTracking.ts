"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Socket } from "socket.io-client";

import { type TrackingReservation, type ChatMessage } from "@/types";
import { getDeadlineText } from "../utils/dateUtils";
import { useTrackingSocket } from "./useTrackingSocket";
import { useTrackingActions } from "./useTrackingActions";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useTracking() {
  const params = useParams();
  const token = params?.token as string;

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [reservation, setReservation] = useState<TrackingReservation | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // 1. Check localStorage for pre-verified email
  useEffect(() => {
    if (!token) return;
    const stored = localStorage.getItem(`verified_email_res_${token}`);
    if (stored) {
      setVerifiedEmail(stored);
    } else {
      setLoading(false);
    }
  }, [token]);

  // 2. Fetch reservation once verified
  useEffect(() => {
    if (!token || !verifiedEmail) return;
    setLoading(true);
    setError("");
    fetch(
      `${API}/bookings/track/${token}?email=${encodeURIComponent(verifiedEmail)}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch reservation details");
        return res.json() as Promise<TrackingReservation>;
      })
      .then((data) => {
        setReservation(data);
        if (data.clientSelectedPackageId)
          setSelectedPkgId(data.clientSelectedPackageId);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load reservation");
        setLoading(false);
      });
  }, [token, verifiedEmail]);

  const scrollToBottom = () => {
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  // 3. Chat + Socket.io
  useTrackingSocket(
    reservation,
    verifiedEmail,
    token,
    setMessages,
    setReservation,
    socketRef,
    scrollToBottom,
  );

  const actions = useTrackingActions(
    token,
    verifiedEmail,
    setVerifiedEmail,
    setVerificationError,
    setVerifying,
    setReservation,
    setConfirming,
    setCancelling,
  );

  const refetchReservation = () => {
    if (!token || !verifiedEmail) return;
    fetch(
      `${API}/bookings/track/${token}?email=${encodeURIComponent(verifiedEmail)}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch reservation details");
        return res.json() as Promise<TrackingReservation>;
      })
      .then((data) => {
        setReservation(data);
        if (data.clientSelectedPackageId)
          setSelectedPkgId(data.clientSelectedPackageId);
      })
      .catch(console.error);
  };

  return {
    token,
    verifiedEmail,
    setVerifiedEmail,
    emailInput,
    setEmailInput,
    verifying,
    verificationError,
    reservation,
    loading,
    error,
    messages,
    messageText,
    setMessageText,
    socketRef,
    chatEndRef,
    selectedPkgId,
    setSelectedPkgId,
    confirming,
    cancelling,
    handleVerifyEmail: (e: React.FormEvent) => {
      e.preventDefault();
      actions.handleVerifyEmail(emailInput);
    },
    handleSendMessage: (e: React.FormEvent) => {
      e.preventDefault();
      actions.handleSendMessage(messageText);
      setMessageText("");
    },
    handleConfirmReservation: () =>
      actions.handleConfirmReservation(selectedPkgId),
    handleCancelReservation: actions.handleCancelReservation,
    getDeadlineText,
    setReservation,
    refetchReservation,
  };
}
