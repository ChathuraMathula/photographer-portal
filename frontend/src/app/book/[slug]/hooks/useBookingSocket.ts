"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { type PhotographerProfile } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || API.replace(/\/api\/?$/, "");

export function useBookingSocket(
  slug: string,
  setProfile: React.Dispatch<React.SetStateAction<PhotographerProfile | null>>,
) {
  useEffect(() => {
    if (!slug) return;
    const socket = io(SOCKET_URL);
    socket.emit("joinBooking", { bookingSlug: slug });

    socket.on("profileUpdated", (updatedProfile: PhotographerProfile) => {
      console.log("⚡ Real-time profile update received:", updatedProfile);
      setProfile((prev) => {
        if (!prev) return updatedProfile;
        return {
          ...prev,
          ...updatedProfile,
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [slug, setProfile]);
}
