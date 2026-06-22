import { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { ChatBox } from "@/components/common/ChatBox";
import { type Reservation, type ChatMessage } from "@/types";

type Props = {
  selectedRes: Reservation;
  messages: ChatMessage[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSend: (e: React.FormEvent) => void;
  chatDisabled: boolean;
};

export function FloatingChatWidget({
  selectedRes,
  messages,
  messageText,
  onMessageChange,
  onSend,
  chatDisabled,
}: Props) {
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; buttonX: number; buttonY: number } | null>(null);

  useEffect(() => {
    if (selectedRes) {
      setShowFloatingChat(true);
    } else {
      setShowFloatingChat(false);
    }
  }, [selectedRes]);

  // Draggable logic for floating button
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
    };
    setIsDragging(false);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
      }
      let newX = dragRef.current.buttonX + dx;
      let newY = dragRef.current.buttonY + dy;
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      newX = Math.max(8, Math.min(newX, maxX));
      newY = Math.max(8, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setTimeout(() => {
        dragRef.current = null;
      }, 50);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
    };
    setIsDragging(false);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!dragRef.current) return;
      const touchMove = moveEvent.touches[0];
      const dx = touchMove.clientX - dragRef.current.startX;
      const dy = touchMove.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
      }
      let newX = dragRef.current.buttonX + dx;
      let newY = dragRef.current.buttonY + dy;
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      newX = Math.max(8, Math.min(newX, maxX));
      newY = Math.max(8, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      setTimeout(() => {
        dragRef.current = null;
      }, 50);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const getUnreadCount = (msgs: any[]) => {
    let lastPhotographerIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === "PHOTOGRAPHER") {
        lastPhotographerIndex = i;
        break;
      }
    }
    let unread = 0;
    for (let i = lastPhotographerIndex + 1; i < msgs.length; i++) {
      if (msgs[i].sender === "CUSTOMER") {
        unread++;
      }
    }
    return unread;
  };

  const unreadCount = showFloatingChat ? 0 : getUnreadCount(messages);

  const getChatBoxStyle = (): React.CSSProperties => {
    if (!position) {
      return {
        position: "fixed",
        bottom: "88px",
        right: "24px",
      };
    }
    const chatWidth = typeof window !== "undefined" && window.innerWidth < 640 ? 340 : 400;
    const chatHeight = 500;
    let chatTop = position.y - chatHeight - 12;
    if (chatTop < 8) {
      chatTop = position.y + 64 + 12;
    }
    let chatLeft = position.x + 28 - chatWidth / 2;
    const maxLeft = window.innerWidth - chatWidth - 12;
    chatLeft = Math.max(12, Math.min(chatLeft, maxLeft));
    return {
      position: "fixed",
      top: `${chatTop}px`,
      left: `${chatLeft}px`,
    };
  };

  return (
    <div className="select-none">
      {showFloatingChat && (
        <div
          style={getChatBoxStyle()}
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
          />
        </div>
      )}
      <button
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          setShowFloatingChat(!showFloatingChat);
        }}
        style={
          position
            ? {
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: "auto",
                right: "auto",
              }
            : {
                position: "fixed",
                bottom: "24px",
                right: "24px",
              }
        }
        className="btn btn-primary rounded-full h-14 w-14 p-0 shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer touch-none z-40"
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
    </div>
  );
}
