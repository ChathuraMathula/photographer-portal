"use client";

import React from "react";
import { MessageSquare, X } from "lucide-react";

interface FloatingChatButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  showFloatingChat: boolean;
  unreadCount: number;
  position: { x: number; y: number } | null;
  onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onTouchStart: (e: React.TouchEvent<HTMLButtonElement>) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function FloatingChatButton({
  buttonRef,
  showFloatingChat,
  unreadCount,
  position,
  onMouseDown,
  onTouchStart,
  onClick,
}: FloatingChatButtonProps) {
  const getStyle = (): React.CSSProperties => {
    if (position) {
      return {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: "auto",
        right: "auto",
      };
    }
    return {
      position: "fixed",
      bottom: "24px",
      right: "24px",
    };
  };

  return (
    <button
      ref={buttonRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={onClick}
      style={getStyle()}
      className="bg-[#0e2d5c] hover:bg-[#1a4175] text-white rounded-full h-14 w-14 shadow-2xl flex items-center justify-center transition-[transform,background-color,box-shadow] duration-200 hover:scale-105 active:scale-95 cursor-pointer touch-none z-40 select-none border-0 focus:outline-none"
    >
      {showFloatingChat ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <div className="relative">
          <MessageSquare className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
