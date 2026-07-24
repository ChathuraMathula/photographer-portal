"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function useUserManagementAuth() {
  const dispatch = useDispatch();
  const { role: loggedInRole, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

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
    window.location.href = "/login";
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
    loggedInRole,
    isAuthenticated,
    authFetch,
  };
}
