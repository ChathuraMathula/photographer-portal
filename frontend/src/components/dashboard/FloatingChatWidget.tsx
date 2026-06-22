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
  
  const isDraggingRef = useRef(false);
  const tickingRef = useRef(false);
  
  const dragRef = useRef<{ 
    startX: number; 
    startY: number; 
    buttonX: number; 
    buttonY: number;
    lastX: number;
    lastY: number;
  } | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedRes) {
      setShowFloatingChat(true);
    } else {
      setShowFloatingChat(false);
    }
  }, [selectedRes]);

  // Draggable logic for floating button - Direct DOM manipulations with requestAnimationFrame for 60FPS smooth dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Temporarily disable CSS transitions during active dragging
    button.style.transition = "none";
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
      lastX: rect.left,
      lastY: rect.top,
    };
    isDraggingRef.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      
      // Threshold to distinguish dragging from clicking
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDraggingRef.current = true;
      }
      
      let newX = dragRef.current.buttonX + dx;
      let newY = dragRef.current.buttonY + dy;
      
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      newX = Math.max(8, Math.min(newX, maxX));
      newY = Math.max(8, Math.min(newY, maxY));
      
      dragRef.current.lastX = newX;
      dragRef.current.lastY = newY;

      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          if (!dragRef.current) {
            tickingRef.current = false;
            return;
          }
          const x = dragRef.current.lastX;
          const y = dragRef.current.lastY;

          // Directly update button style
          if (buttonRef.current) {
            buttonRef.current.style.left = `${x}px`;
            buttonRef.current.style.top = `${y}px`;
            buttonRef.current.style.bottom = "auto";
            buttonRef.current.style.right = "auto";
          }

          // Directly update chat box style if visible
          if (chatRef.current) {
            const chatWidth = window.innerWidth < 640 ? 340 : 400;
            const chatHeight = 500;
            let chatTop = y - chatHeight - 12;
            if (chatTop < 8) {
              chatTop = y + 64 + 12;
            }
            let chatLeft = x + 28 - chatWidth / 2;
            const maxLeft = window.innerWidth - chatWidth - 12;
            chatLeft = Math.max(12, Math.min(chatLeft, maxLeft));

            chatRef.current.style.left = `${chatLeft}px`;
            chatRef.current.style.top = `${chatTop}px`;
            chatRef.current.style.bottom = "auto";
            chatRef.current.style.right = "auto";
          }
          tickingRef.current = false;
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      
      // Restore transition styles
      if (buttonRef.current) {
        buttonRef.current.style.transition = "";
      }
      
      if (dragRef.current) {
        setPosition({ x: dragRef.current.lastX, y: dragRef.current.lastY });
      }
      
      // Reset dragging flag after a tiny delay so onClick handler knows it was a drag
      setTimeout(() => {
        dragRef.current = null;
        isDraggingRef.current = false;
      }, 50);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Temporarily disable CSS transitions during active dragging
    button.style.transition = "none";
    
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
      lastX: rect.left,
      lastY: rect.top,
    };
    isDraggingRef.current = false;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!dragRef.current) return;
      const touchMove = moveEvent.touches[0];
      const dx = touchMove.clientX - dragRef.current.startX;
      const dy = touchMove.clientY - dragRef.current.startY;
      
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDraggingRef.current = true;
      }
      
      let newX = dragRef.current.buttonX + dx;
      let newY = dragRef.current.buttonY + dy;
      
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      newX = Math.max(8, Math.min(newX, maxX));
      newY = Math.max(8, Math.min(newY, maxY));
      
      dragRef.current.lastX = newX;
      dragRef.current.lastY = newY;

      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          if (!dragRef.current) {
            tickingRef.current = false;
            return;
          }
          const x = dragRef.current.lastX;
          const y = dragRef.current.lastY;

          // Directly update button style
          if (buttonRef.current) {
            buttonRef.current.style.left = `${x}px`;
            buttonRef.current.style.top = `${y}px`;
            buttonRef.current.style.bottom = "auto";
            buttonRef.current.style.right = "auto";
          }

          // Directly update chat box style if visible
          if (chatRef.current) {
            const chatWidth = window.innerWidth < 640 ? 340 : 400;
            const chatHeight = 500;
            let chatTop = y - chatHeight - 12;
            if (chatTop < 8) {
              chatTop = y + 64 + 12;
            }
            let chatLeft = x + 28 - chatWidth / 2;
            const maxLeft = window.innerWidth - chatWidth - 12;
            chatLeft = Math.max(12, Math.min(chatLeft, maxLeft));

            chatRef.current.style.left = `${chatLeft}px`;
            chatRef.current.style.top = `${chatTop}px`;
            chatRef.current.style.bottom = "auto";
            chatRef.current.style.right = "auto";
          }
          tickingRef.current = false;
        });
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      
      // Restore transition styles
      if (buttonRef.current) {
        buttonRef.current.style.transition = "";
      }
      
      if (dragRef.current) {
        setPosition({ x: dragRef.current.lastX, y: dragRef.current.lastY });
      }
      
      // Reset dragging flag after a tiny delay so onClick handler knows it was a drag
      setTimeout(() => {
        dragRef.current = null;
        isDraggingRef.current = false;
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
          ref={chatRef}
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
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => {
          if (isDraggingRef.current) {
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
    </div>
  );
}
