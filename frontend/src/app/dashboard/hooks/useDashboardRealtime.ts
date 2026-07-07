"use client";

import { useEffect } from "react";
import { UserRole } from "@/store/slices/authSlice";
import { handleReservationCreated } from "./realtime/handleReservationCreated";
import { handleReservationUpdated } from "./realtime/handleReservationUpdated";
import { handleMessageReceived } from "./realtime/handleMessageReceived";
import { handleTransactionLogged } from "./realtime/handleTransactionLogged";

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

    const onCreated = (res: any) =>
      handleReservationCreated(res, { reservationsState, setNotifications, loadTransactions });

    const onUpdated = (res: any) =>
      handleReservationUpdated(res, { reservationsState, loadTransactions });

    const onMessage = (data: any) =>
      handleMessageReceived(data, { reservationsState, chat, setNotifications, setForceOpenChat, router });

    const onTransaction = (data: any) =>
      handleTransactionLogged(data, { loadTransactions, reservationsState });

    socket.on("reservationCreated", onCreated);
    socket.on("reservationUpdated", onUpdated);
    socket.on("messageReceived", onMessage);
    socket.on("transactionLogged", onTransaction);

    return () => {
      socket.off("reservationCreated", onCreated);
      socket.off("reservationUpdated", onUpdated);
      socket.off("messageReceived", onMessage);
      socket.off("transactionLogged", onTransaction);
    };
  }, [socket, isAuthenticated, role, userId, reservationsState, chat, router]);
}
