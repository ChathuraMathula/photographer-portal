"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "@/store/store";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, id: userId, role } = useSelector((state: RootState) => state.auth);
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
      console.log(`🔌 Global WebSocket Connected: ${socketInstance.id} (User: ${userId}, Role: ${role})`);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Global WebSocket Disconnected");
    });

    return () => {
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
