"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { PhotographerProfileItem, PaginationMeta } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? API;

export function usePhotographers() {
  const [photographers, setPhotographers] = useState<PhotographerProfileItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Fetch photographers page
  const fetchPhotographers = useCallback(
    async (pageNum: number, isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError("");

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "6",
        });

        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        const res = await fetch(`${API}/photographers/public?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch photographers");

        const result: { data: PhotographerProfileItem[]; meta: PaginationMeta } =
          await res.json();

        if (isInitial) {
          setPhotographers(result.data || []);
        } else {
          setPhotographers((prev) => {
            // Prevent duplicate entries
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = (result.data || []).filter((p) => !existingIds.has(p.id));
            return [...prev, ...newUnique];
          });
        }

        setHasMore(result.meta ? result.meta.hasMore : false);
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message || "Error loading photographers");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm]
  );

  // Initial load or search change reset
  useEffect(() => {
    fetchPhotographers(1, true);
  }, [searchTerm, fetchPhotographers]);

  // Load next page function
  const loadNextPage = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchPhotographers(page + 1, false);
    }
  }, [loading, loadingMore, hasMore, page, fetchPhotographers]);

  // IntersectionObserver for dynamic scroll loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, loadNextPage]);

  // Real-time WebSocket connection for live updates
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const handleUpdate = (updatedData: Partial<PhotographerProfileItem>) => {
      setPhotographers((prev) =>
        prev.map((p) => {
          if (
            (updatedData.id && p.id === updatedData.id) ||
            (updatedData.userId && p.userId === updatedData.userId) ||
            (updatedData.bookingSlug && p.bookingSlug === updatedData.bookingSlug)
          ) {
            return {
              ...p,
              ...updatedData,
              isAvailableForBooking:
                updatedData.isAvailableForBooking !== undefined
                  ? updatedData.isAvailableForBooking
                  : p.isAvailableForBooking,
              rating: updatedData.rating !== undefined ? updatedData.rating : p.rating,
              ratingCount:
                updatedData.ratingCount !== undefined
                  ? updatedData.ratingCount
                  : p.ratingCount,
            };
          }
          return p;
        })
      );
    };

    socket.on("photographerUpdated", handleUpdate);
    socket.on("profileUpdated", handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, []);

  // Submit rating function
  const submitRating = async (profileId: string, rating: number) => {
    const res = await fetch(`${API}/photographers/${profileId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to submit rating");
    }

    const updatedProfile = await res.json();

    // Optimistically update state
    setPhotographers((prev) =>
      prev.map((p) =>
        p.id === profileId
          ? {
              ...p,
              rating: updatedProfile.rating,
              ratingCount: updatedProfile.ratingCount,
            }
          : p
      )
    );
  };

  return {
    photographers,
    loading,
    loadingMore,
    hasMore,
    error,
    searchTerm,
    setSearchTerm,
    observerTargetRef,
    submitRating,
  };
}
