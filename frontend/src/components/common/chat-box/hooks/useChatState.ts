import { useState, useEffect, useRef } from "react";
import { type ChatMessage } from "@/types";

export function useChatState(
  messages: ChatMessage[],
  reservationId?: string,
  myRole?: string,
) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastResIdRef = useRef<string | null>(null);
  const [initialLastViewed, setInitialLastViewed] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (reservationId && myRole) {
      if (reservationId !== lastResIdRef.current) {
        lastResIdRef.current = reservationId;
        const key = `chat_last_viewed_${myRole.toLowerCase()}_${reservationId}`;
        const stored = localStorage.getItem(key);
        setInitialLastViewed(stored || new Date().toISOString());

        const timer = setTimeout(() => {
          localStorage.setItem(key, new Date().toISOString());
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setInitialLastViewed(null);
    }
  }, [reservationId, myRole]);

  useEffect(() => {
    if (reservationId && myRole && messages.length > 0) {
      const key = `chat_last_viewed_${myRole.toLowerCase()}_${reservationId}`;
      localStorage.setItem(key, new Date().toISOString());
    }
  }, [messages.length, reservationId, myRole]);

  const firstUnreadIndex = messages.findIndex(
    (msg) =>
      msg.sender !== myRole &&
      initialLastViewed &&
      new Date(msg.timestamp).getTime() > new Date(initialLastViewed).getTime(),
  );

  const unreadCount =
    firstUnreadIndex !== -1 ? messages.length - firstUnreadIndex : 0;

  return { chatEndRef, containerRef, firstUnreadIndex, unreadCount };
}
