"use client";

import { useEffect, useRef } from "react";
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
  // Use refs to hold the latest callbacks/state so event listeners never need
  // to re-register just because a dependency changed.
  const reservationsStateRef = useRef(reservationsState);
  const chatRef = useRef(chat);
  const loadTransactionsRef = useRef(loadTransactions);
  const setNotificationsRef = useRef(setNotifications);
  const setForceOpenChatRef = useRef(setForceOpenChat);
  const routerRef = useRef(router);

  // Keep refs in sync with latest props every render — no effect needed
  reservationsStateRef.current = reservationsState;
  chatRef.current = chat;
  loadTransactionsRef.current = loadTransactions;
  setNotificationsRef.current = setNotifications;
  setForceOpenChatRef.current = setForceOpenChat;
  routerRef.current = router;

  // Only re-run when the socket connection or auth identity changes
  useEffect(() => {
    if (!socket || !isAuthenticated || role !== UserRole.PHOTOGRAPHER || !userId) {
      return;
    }

    // Emit join exactly once per socket connection
    socket.emit("joinPhotographerDashboard", { photographerId: userId });

    const onCreated = (res: any) =>
      handleReservationCreated(res, {
        reservationsState: reservationsStateRef.current,
        setNotifications: setNotificationsRef.current,
        loadTransactions: loadTransactionsRef.current,
        router: routerRef.current,
      });

    const onUpdated = (res: any) =>
      handleReservationUpdated(res, {
        reservationsState: reservationsStateRef.current,
        loadTransactions: loadTransactionsRef.current,
      });

    const onMessage = (data: any) =>
      handleMessageReceived(data, {
        reservationsState: reservationsStateRef.current,
        chat: chatRef.current,
        setNotifications: setNotificationsRef.current,
        setForceOpenChat: setForceOpenChatRef.current,
        router: routerRef.current,
      });

    const onTransaction = (data: any) =>
      handleTransactionLogged(data, {
        loadTransactions: loadTransactionsRef.current,
        reservationsState: reservationsStateRef.current,
      });

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
    // Intentionally only depends on stable primitives to avoid repeated joins
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isAuthenticated, role, userId]);
}
