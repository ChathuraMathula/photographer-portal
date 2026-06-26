"use client";

import { useState } from "react";
import { type NotificationItem } from "@/types";

export function useDashboardNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    setNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClearAllNotifications,
  };
}
