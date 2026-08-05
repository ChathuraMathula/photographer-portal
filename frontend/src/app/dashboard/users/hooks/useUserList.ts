"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { UserRole } from "@/store/slices/authSlice";
import { type UserAccount } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface UseUserListProps {
  isAuthenticated: boolean;
  loggedInRole: UserRole | null;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export function useUserList({
  isAuthenticated,
  loggedInRole,
  authFetch,
}: UseUserListProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await authFetch(`${API}/users?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load users");

      setUsers(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, limit, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    if (
      isAuthenticated &&
      (loggedInRole === UserRole.SUPER_ADMIN || loggedInRole === UserRole.ADMIN)
    ) {
      fetchUsers();
    }
  }, [isAuthenticated, loggedInRole, fetchUsers]);

  // Auto-refresh: poll every 30 seconds to pick up new registrations
  useEffect(() => {
    if (
      !isAuthenticated ||
      (loggedInRole !== UserRole.SUPER_ADMIN && loggedInRole !== UserRole.ADMIN)
    ) {
      return;
    }

    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loggedInRole, fetchUsers]);

  const handleToggleActive = async (userId: string) => {
    try {
      const res = await authFetch(`${API}/users/${userId}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: data.isActive } : u,
        ),
      );
    } catch (err: any) {
      toast.error(err.message || "Error updating user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await authFetch(`${API}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      toast.success(data.message || "User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    }
  };

  return {
    users,
    loading,
    error,
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    fetchUsers,
    handleToggleActive,
    handleDeleteUser,
  };
}
