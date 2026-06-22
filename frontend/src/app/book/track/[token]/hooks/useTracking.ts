"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

import { type TrackingReservation, type ChatMessage } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useTracking() {
  const params = useParams();
  const token = params?.token as string;

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [reservation, setReservation] = useState<TrackingReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

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
    fetch(`${API}/bookings/track/${token}?email=${encodeURIComponent(verifiedEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch reservation details");
        return res.json() as Promise<TrackingReservation>;
      })
      .then((data) => {
        setReservation(data);
        if (data.clientSelectedPackageId) setSelectedPkgId(data.clientSelectedPackageId);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load reservation");
        setLoading(false);
      });
  }, [token, verifiedEmail]);

  // 3. Chat + Socket.io
  useEffect(() => {
    if (!reservation?.id || !verifiedEmail || !token) return;
    fetch(`${API}/bookings/track/${token}/messages?email=${encodeURIComponent(verifiedEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(console.error);

    const socket = io(API);
    socketRef.current = socket;
    socket.emit("joinReservation", { reservationId: reservation.id });

    socket.on("message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on("reservationUpdated", (updatedRes: any) => {
      setReservation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: updatedRes.status,
          advancePaymentPriceInCents: updatedRes.advancePaymentPriceInCents,
          quotationNotes: updatedRes.quotationNotes,
          clientSelectedPackageId: updatedRes.clientSelectedPackageId,
          selectedPackages: updatedRes.selectedPackages,
          paymentDeadline: updatedRes.paymentDeadline,
          rejectionReason: updatedRes.rejectionReason,
        };
      });
    });

    return () => {
      socket.emit("leaveReservation", { reservationId: reservation.id });
      socket.disconnect();
    };
  }, [reservation?.id, verifiedEmail, token]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationError("");
    try {
      const res = await fetch(`${API}/bookings/track/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email verification failed");
      localStorage.setItem(`verified_email_res_${token}`, emailInput);
      setVerifiedEmail(emailInput);
    } catch (err: any) {
      setVerificationError(err.message || "Verification failed");
      setVerifying(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !verifiedEmail || !token) return;
    try {
      const text = messageText;
      setMessageText("");
      await fetch(`${API}/bookings/track/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedEmail, content: text }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedPkgId || !verifiedEmail || !token) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API}/bookings/track/${token}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedEmail, packageId: selectedPkgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Confirmation failed");
      setReservation((prev) =>
        prev ? { ...prev, status: "CONFIRMED", clientSelectedPackageId: selectedPkgId } : null
      );
      setConfirming(false);
    } catch (err: any) {
      alert(err.message || "Failed to confirm reservation");
      setConfirming(false);
    }
  };

  const getDeadlineText = (deadlineStr?: string) => {
    if (!deadlineStr) return "";
    const deadline = new Date(deadlineStr);
    const diffMs = deadline.getTime() - Date.now();
    if (diffMs <= 0) return "Expired";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m remaining`;
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
    handleVerifyEmail,
    handleSendMessage,
    handleConfirmReservation,
    getDeadlineText,
  };
}
