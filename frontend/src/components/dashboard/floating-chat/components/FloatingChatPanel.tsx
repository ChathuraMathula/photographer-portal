"use client";

import React from "react";
import { type Reservation, type ChatMessage } from "@/types";
import { ChatBox } from "@/components/common/ChatBox";

interface FloatingChatPanelProps {
  chatRef: React.RefObject<HTMLDivElement | null>;
  selectedRes: Reservation;
  messages: ChatMessage[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  chatDisabled: boolean;
  position: { x: number; y: number } | null;
}

export function FloatingChatPanel({
  chatRef,
  selectedRes,
  messages,
  messageText,
  onMessageChange,
  onSend,
  chatDisabled,
  position,
}: FloatingChatPanelProps) {
  const getStyle = (): React.CSSProperties => {
    if (!position) {
      return {
        position: "fixed",
        bottom: "88px",
        right: "24px",
      };
    }
    const w = window.innerWidth < 640 ? 340 : 400;
    let top = position.y - 512;
    if (top < 8) top = position.y + 76;
    return {
      position: "fixed",
      top: `${top}px`,
      left: `${Math.max(12, Math.min(position.x + 28 - w / 2, window.innerWidth - w - 12))}px`,
    };
  };

  return (
    <div
      ref={chatRef}
      style={getStyle()}
      className="w-[340px] sm:w-[400px] shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in slide-in-from-bottom-4 duration-200 z-40"
    >
      <ChatBox
        messages={messages}
        messageText={messageText}
        onMessageChange={onMessageChange}
        onSend={onSend}
        disabled={chatDisabled}
        myRole="PHOTOGRAPHER"
        title={`Chat with ${selectedRes.customer.firstName}`}
        description={`Negotiating details for ${selectedRes.eventType}`}
        reservationId={selectedRes.id}
      />
    </div>
  );
}
