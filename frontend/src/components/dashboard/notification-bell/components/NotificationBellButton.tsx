import React from "react";
import { Bell, BellRing, BellOff } from "lucide-react";

type Props = {
  inAppNotificationsEnabled: boolean;
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
};

export function NotificationBellButton({
  inAppNotificationsEnabled,
  unreadCount,
  isOpen,
  onToggle,
}: Props) {
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
    <button
      onClick={onToggle}
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
  );
}
