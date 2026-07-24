"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useDashboardAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    firstName,
    role,
    id: userId,
    isAuthenticated,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout error:", err);
    }
    dispatch(logout());
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const res = await fetch(input, init);
    if (res.status === 401) {
      handleLogout();
    }
    return res;
  };

  return {
    firstName,
    role,
    userId,
    isAuthenticated,
    handleLogout,
    authFetch,
  };
}
