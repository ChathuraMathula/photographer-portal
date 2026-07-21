"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    id: userId,
    role,
  } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketInstance = io(API, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnected(true);
      console.log(
        `🔌 Global WebSocket Connected: ${socketInstance.id} (User: ${userId}, Role: ${role})`,
      );

      // Join personal user room for account-level events
      if (userId) {
        socketInstance.emit("joinUserRoom", { userId });
      }
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Global WebSocket Disconnected");
    });

    // Handle real-time account deactivation
    const handleUserDeactivated = async () => {
      console.log("🚫 Account deactivated — logging out...");

      try {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Backend logout error:", err);
      }

      dispatch(logout());
      socketInstance.disconnect();
      window.location.href = "/login?deactivated=true";
    };

    socketInstance.on("userDeactivated", handleUserDeactivated);

    return () => {
      socketInstance.off("userDeactivated", handleUserDeactivated);
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isAuthenticated, userId, role]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
