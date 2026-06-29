"use client";

import React, { useState, useEffect, useRef } from "react";
import { type NotificationItem } from "@/types";
import { Bell, BellRing, BellOff, MessageSquare, Calendar, X, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  // Close drop-down on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    onMarkAsRead(item.id);
    onSelectReservation(item.referenceId, item.type);
    setIsOpen(false);
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // When in-app notifications are disabled, render a static disabled bell
  if (!inAppNotificationsEnabled) {
    return (
      <button
        disabled
        className="relative h-9 w-9 flex items-center justify-center rounded-full text-zinc-300 dark:text-zinc-600 cursor-not-allowed opacity-50"
        title="In-app notifications are disabled"
      >
        <BellOff className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer focus:outline-none"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing className="h-5 w-5 text-[#0e2d5c] dark:text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          {/* Popover Header */}
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
                <CheckCheck className="h-3.5 w-3.5" />
                Read all
              </button>
            )}
          </div>

          {/* Popover Body List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="h-8 w-8 text-zinc-350 dark:text-zinc-600 mb-2" />
                <p className="text-body-caption font-semibold text-zinc-400">All caught up!</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">No recent notifications received.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex gap-3 p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-950/40 cursor-pointer transition-colors relative items-start ${
                    !item.read ? "bg-zinc-50/20 dark:bg-zinc-950/10" : ""
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!item.read && (
                    <span className="absolute left-2.5 top-5 h-2 w-2 rounded-full bg-[#0e2d5c] dark:bg-white" />
                  )}

                  {/* Icon Box */}
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    item.type === "chat" 
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                      : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                  }`}>
                    {item.type === "chat" ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>

                  {/* Content text */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-body-caption font-bold text-zinc-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-normal line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[9px] text-zinc-450 dark:text-zinc-500 block font-medium">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2.5 bg-zinc-50/30 dark:bg-zinc-950/10 dark:border-zinc-800 flex justify-center">
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
