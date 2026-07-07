"use client";

import { toast } from "sonner";
import { type Reservation } from "@/types";

interface MessageReceivedContext {
  reservationsState: any;
  chat: any;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  setForceOpenChat: React.Dispatch<React.SetStateAction<number>>;
  router: any;
}

export function handleMessageReceived(
  { reservationId, message }: { reservationId: string; message: any },
  ctx: MessageReceivedContext,
) {
  ctx.reservationsState.setReservations((prev: Reservation[]) =>
    prev.map((r) => {
      if (r.id === reservationId) {
        const currentMessages = r.messages || [];
        if (currentMessages.some((m) => m.id === message.id)) return r;
        return { ...r, messages: [...currentMessages, message] };
      }
      return r;
    }),
  );

  ctx.reservationsState.setSelectedRes((prev: Reservation | null) => {
    if (prev && prev.id === reservationId) {
      ctx.chat.setMessages((msgs: any[]) => {
        if (msgs.some((m) => m.id === message.id)) return msgs;
        return [...msgs, message];
      });
    }
    return prev;
  });

  if (message.sender === "CUSTOMER") {
    ctx.setNotifications((prev) => [
      {
        id: `msg_${message.id}`,
        title: `New Message from ${message.senderName}`,
        description: message.content,
        timestamp: new Date().toISOString(),
        read: false,
        type: "chat" as const,
        referenceId: reservationId,
      },
      ...prev,
    ]);

    toast.success(
      `Message from ${message.senderName}: "${message.content.substring(0, 40)}${message.content.length > 40 ? "..." : ""}"`,
      {
        action: {
          label: "Reply",
          onClick: () => {
            const res = ctx.reservationsState.reservations.find(
              (r: Reservation) => r.id === reservationId,
            );
            if (res) {
              ctx.reservationsState.setSelectedRes(res);
              ctx.setForceOpenChat((prev: number) => prev + 1);
              ctx.router.push(`/dashboard/reservations?id=${reservationId}`);
            }
          },
        },
        duration: 6000,
      },
    );
  }
}
