"use client";

import { useState, useEffect } from "react";
import { type NotificationItem } from "@/types";
import { UserRole } from "@/store/slices/authSlice";

interface Props {
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
  role: string | null;
}

export function useDashboardNotifications({ authFetch, isAuthenticated, role }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated || role !== UserRole.PHOTOGRAPHER) return;
    
    authFetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/reservations/notifications/unread`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const initialNotifications: NotificationItem[] = [];
        
        data.reservations?.forEach((res: any) => {
          initialNotifications.push({
            id: `res-${res.id}`,
            referenceId: res.id,
            title: "New Booking Request",
            description: `${res.customer?.firstName} ${res.customer?.lastName} sent a booking request.`,
            timestamp: new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            type: "booking",
          });
        });
        
        data.messages?.forEach((msg: any) => {
          initialNotifications.push({
            id: `msg-${msg.id}`,
            referenceId: msg.reservationId,
            title: "New Message",
            description: `${msg.senderName} sent a message.`,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            type: "chat",
          });
        });
        
        setNotifications(initialNotifications.reverse());
      })
      .catch((err) => console.error("Failed to load notifications:", err));
  }, [isAuthenticated, role]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    const notification = notifications.find((n) => n.id === id);
    if (!notification) return;

    if (notification.type === "booking") {
      authFetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/reservations/${notification.referenceId}/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch(console.error);
    } else if (notification.type === "chat") {
      authFetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/reservations/${notification.referenceId}/messages/read`, {
        method: "PATCH",
        credentials: "include",
      }).catch(console.error);
    }
  };

  const handleMarkAllAsRead = () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    unread.forEach((notification) => {
      if (notification.type === "booking") {
        authFetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/reservations/${notification.referenceId}/read`, {
          method: "PATCH",
          credentials: "include",
        }).catch(console.error);
      } else if (notification.type === "chat") {
        authFetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/reservations/${notification.referenceId}/messages/read`, {
          method: "PATCH",
          credentials: "include",
        }).catch(console.error);
      }
    });
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
