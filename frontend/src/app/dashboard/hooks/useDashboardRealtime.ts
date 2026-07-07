"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { UserRole } from "@/store/slices/authSlice";
import { type Reservation } from "@/types";

interface Props {
  socket: any;
  isAuthenticated: boolean;
  role: string | null;
  userId: string | null;
  reservationsState: any;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  loadTransactions: () => Promise<void>;
  chat: any;
  setForceOpenChat: React.Dispatch<React.SetStateAction<number>>;
  router: any;
}

export function useDashboardRealtime({
  socket,
  isAuthenticated,
  role,
  userId,
  reservationsState,
  setNotifications,
  loadTransactions,
  chat,
  setForceOpenChat,
  router,
}: Props) {
  useEffect(() => {
    if (!socket || !isAuthenticated || role !== UserRole.PHOTOGRAPHER || !userId) {
      return;
    }

    socket.emit("joinPhotographerDashboard", { photographerId: userId });

    const handleReservationCreated = (newRes: Reservation) => {
      reservationsState.setReservations((prev: Reservation[]) => {
        if (prev.some((r) => r.id === newRes.id)) return prev;
        return [newRes, ...prev];
      });
      setNotifications((prev) => [
        {
          id: `booking_${newRes.id}_${Date.now()}`,
          title: "New Booking Request",
          description: `${newRes.customer?.firstName ?? "Client"} requested a ${newRes.eventType} session.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "booking" as const,
          referenceId: newRes.id,
        },
        ...prev,
      ]);
      loadTransactions();
      toast.info(`New booking request from ${newRes.customer?.firstName ?? "Client"}!`);
    };

    const handleReservationUpdated = (updatedRes: Reservation) => {
      reservationsState.setReservations((prev: Reservation[]) =>
        prev.map((r) => (r.id === updatedRes.id ? updatedRes : r))
      );
      reservationsState.setSelectedRes((prev: Reservation | null) =>
        prev && prev.id === updatedRes.id ? updatedRes : prev
      );
      loadTransactions();
    };

    const handleMessageReceived = ({ reservationId, message }: any) => {
      reservationsState.setReservations((prev: Reservation[]) =>
        prev.map((r) => {
          if (r.id === reservationId) {
            const currentMessages = r.messages || [];
            if (currentMessages.some((m) => m.id === message.id)) return r;
            return {
              ...r,
              messages: [...currentMessages, message],
            };
          }
          return r;
        })
      );

      reservationsState.setSelectedRes((prev: Reservation | null) => {
        if (prev && prev.id === reservationId) {
          chat.setMessages((msgs: any[]) => {
            if (msgs.some((m) => m.id === message.id)) return msgs;
            return [...msgs, message];
          });
        }
        return prev;
      });

      if (message.sender === "CUSTOMER") {
        setNotifications((prev) => [
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
                const res = reservationsState.reservations.find((r: Reservation) => r.id === reservationId);
                if (res) {
                  reservationsState.setSelectedRes(res);
                  setForceOpenChat((prev) => prev + 1);
                  router.push(`/dashboard/reservations?id=${reservationId}`);
                }
              }
            },
            duration: 6000,
          }
        );
      }
    };

    const handleTransactionLogged = (data?: { reservationId: string }) => {
      loadTransactions();
      if (data?.reservationId) {
        if (reservationsState.setPaymentsUpdatedTrigger) {
          reservationsState.setPaymentsUpdatedTrigger((prev: number) => prev + 1);
        }
        if (reservationsState.fetchReservations) {
          reservationsState.fetchReservations();
        }
      }
    };

    socket.on("reservationCreated", handleReservationCreated);
    socket.on("reservationUpdated", handleReservationUpdated);
    socket.on("messageReceived", handleMessageReceived);
    socket.on("transactionLogged", handleTransactionLogged);

    return () => {
      socket.off("reservationCreated", handleReservationCreated);
      socket.off("reservationUpdated", handleReservationUpdated);
      socket.off("messageReceived", handleMessageReceived);
      socket.off("transactionLogged", handleTransactionLogged);
    };
  }, [socket, isAuthenticated, role, userId, reservationsState, chat, router]);
}
