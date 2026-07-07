"use client";

import React, { useRef } from "react";
import { type Reservation, type ChatMessage } from "@/types";
import { useFloatingChatState } from "./floating-chat/hooks/useFloatingChatState";
import { useFloatingChatDrag } from "./floating-chat/hooks/useFloatingChatDrag";
import { FloatingChatButton } from "./floating-chat/components/FloatingChatButton";
import { FloatingChatPanel } from "./floating-chat/components/FloatingChatPanel";

type Props = {
  selectedRes: Reservation;
  messages: ChatMessage[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  chatDisabled: boolean;
  forceOpen?: number;
};

export function FloatingChatWidget({
  selectedRes,
  messages,
  messageText,
  onMessageChange,
  onSend,
  chatDisabled,
  forceOpen,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const { showFloatingChat, setShowFloatingChat, unreadCount } = useFloatingChatState({
    selectedRes,
    messages,
    forceOpen,
    chatRef,
    buttonRef,
  });

  const { position, isDraggingRef, handleMouseDown, handleTouchStart } = useFloatingChatDrag(
    buttonRef,
    chatRef
  );

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setShowFloatingChat(!showFloatingChat);
  };

  return (
    <div className="select-none">
      {showFloatingChat && selectedRes && (
        <FloatingChatPanel
          chatRef={chatRef}
          selectedRes={selectedRes}
          messages={messages}
          messageText={messageText}
          onMessageChange={onMessageChange}
          onSend={onSend}
          chatDisabled={chatDisabled}
          position={position}
        />
      )}
      <FloatingChatButton
        buttonRef={buttonRef}
        showFloatingChat={showFloatingChat}
        unreadCount={unreadCount}
        position={position}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleButtonClick}
      />
    </div>
  );
}
