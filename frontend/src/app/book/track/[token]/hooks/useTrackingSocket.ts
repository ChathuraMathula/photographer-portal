"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { type ChatMessage, type TrackingReservation } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useTrackingSocket(
  reservation: TrackingReservation | null,
  verifiedEmail: string | null,
  token: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setReservation: React.Dispatch<
    React.SetStateAction<TrackingReservation | null>
  >,
  socketRef: React.MutableRefObject<Socket | null>,
  scrollToBottom?: () => void,
) {
  const scrollToBottomRef = useRef(scrollToBottom);

  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
  }, [scrollToBottom]);

  useEffect(() => {
    if (!reservation?.id || !verifiedEmail || !token) return;

    fetch(
      `${API}/bookings/track/${token}/messages?email=${encodeURIComponent(verifiedEmail)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setMessages(data || []);
        scrollToBottomRef.current?.();
      })
      .catch(console.error);

    const socket = io(API, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinReservation", { reservationId: reservation.id });
    });

    if (socket.connected) {
      socket.emit("joinReservation", { reservationId: reservation.id });
    }

    socket.on("message", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      scrollToBottomRef.current?.();
    });

    socket.on("reservationUpdated", (updatedRes: any) => {
      setReservation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: updatedRes.status,
          advancePaymentPriceInCents: updatedRes.advancePaymentPriceInCents,
          totalAmountInCents: updatedRes.totalAmountInCents,
          totalPaidInCents: updatedRes.totalPaidInCents,
          quotationNotes: updatedRes.quotationNotes,
          clientSelectedPackageId: updatedRes.clientSelectedPackageId,
          selectedPackages: updatedRes.selectedPackages,
          paymentDeadline: updatedRes.paymentDeadline,
          rejectionReason: updatedRes.rejectionReason,
        };
      });
    });

    socket.on("transactionLogged", () => {
      fetch(
        `${API}/bookings/track/${token}?email=${encodeURIComponent(verifiedEmail)}`,
      )
        .then((res) => {
          if (!res.ok) throw new Error("Could not refetch");
          return res.json() as Promise<TrackingReservation>;
        })
        .then((data) => {
          setReservation(data);
        })
        .catch(console.error);
    });

    return () => {
      socket.emit("leaveReservation", { reservationId: reservation.id });
      socket.disconnect();
    };
  }, [reservation?.id, verifiedEmail, token]);
}
