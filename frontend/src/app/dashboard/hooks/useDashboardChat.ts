"use client";

import { useEffect, useState, useRef } from "react";
import { type ChatMessage, type Reservation } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface UseDashboardChatProps {
  socket: any;
  selectedRes: Reservation | null;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
}

export function useDashboardChat({
  socket,
  selectedRes,
  authFetch,
}: UseDashboardChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  useEffect(() => {
    if (!socket || !selectedRes) {
      setMessages([]);
      return;
    }

    authFetch(`${API}/reservations/${selectedRes.id}/messages`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(console.error);

    socket.emit("joinReservation", { reservationId: selectedRes.id });

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    };

    socket.on("message", handleMessage);

    return () => {
      socket.emit("leaveReservation", { reservationId: selectedRes.id });
      socket.off("message", handleMessage);
    };
  }, [socket, selectedRes]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRes) return;
    try {
      const text = messageText;
      setMessageText("");
      await authFetch(`${API}/reservations/${selectedRes.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    messages,
    setMessages,
    messageText,
    setMessageText,
    chatEndRef,
    handleSendChatMessage,
  };
}
