"use client";
import React, { useState, useEffect, useRef } from "react";
import { type NotificationItem } from "@/types";
import { CheckCheck, Trash2 } from "lucide-react";
import { NotificationBellButton } from "./notification-bell/components/NotificationBellButton";
import { NotificationList } from "./notification-bell/components/NotificationList";

type Props = {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectReservation: (resId: string, type?: "chat" | "booking") => void;
  inAppNotificationsEnabled?: boolean;
};

export function NotificationBell({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectReservation,
  inAppNotificationsEnabled = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    onMarkAsRead(item.id);
    onSelectReservation(item.referenceId, item.type);
    setIsOpen(false);
  };

  if (!inAppNotificationsEnabled)
    return (
      <NotificationBellButton
        inAppNotificationsEnabled={false}
        unreadCount={0}
        isOpen={false}
        onToggle={() => {}}
      />
    );

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <NotificationBellButton
        inAppNotificationsEnabled={true}
        unreadCount={unreadCount}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-body-small-s font-extrabold text-zinc-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#0e2d5c]/10 text-[#0e2d5c] dark:bg-white/10 dark:text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-[#0e2d5c] dark:hover:text-white transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Read all
              </button>
            )}
          </div>
          <NotificationList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
          />
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2.5 bg-zinc-50/30 dark:bg-zinc-950/10 dark:border-zinc-800 flex justify-center">
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
