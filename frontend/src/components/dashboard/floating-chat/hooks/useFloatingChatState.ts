"use client";

import { useState, useEffect } from "react";
import { type Reservation, type ChatMessage } from "@/types";

interface UseChatStateProps {
  selectedRes: Reservation;
  messages: ChatMessage[];
  forceOpen?: number;
  chatRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function useFloatingChatState({
  selectedRes,
  messages,
  forceOpen,
  chatRef,
  buttonRef,
}: UseChatStateProps) {
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  useEffect(() => {
    setShowFloatingChat(!!selectedRes);
  }, [selectedRes]);

  useEffect(() => {
    if (forceOpen) {
      setShowFloatingChat(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        showFloatingChat &&
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowFloatingChat(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showFloatingChat, chatRef, buttonRef]);

  const getUnreadCount = (msgs: ChatMessage[]) => {
    if (!selectedRes) return 0;
    const key = `chat_last_viewed_photographer_${selectedRes.id}`;
    const lastViewed = localStorage.getItem(key) || new Date(0).toISOString();
    return msgs.filter(
      (msg) =>
        msg.sender === "CUSTOMER" &&
        new Date(msg.timestamp).getTime() > new Date(lastViewed).getTime()
    ).length;
  };

  const unreadCount = showFloatingChat ? 0 : getUnreadCount(messages);

  return {
    showFloatingChat,
    setShowFloatingChat,
    unreadCount,
  };
}
