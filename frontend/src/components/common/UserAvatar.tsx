"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name?: string;
  className?: string;
  fallbackInitials?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  name = "User",
  className = "h-10 w-10 text-xs font-bold",
  fallbackInitials,
  alt,
}: UserAvatarProps) {
  // Extract initials if fallbackInitials is not explicitly provided
  const initials =
    fallbackInitials ||
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() ||
    "U";

  if (src && src.trim() !== "") {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn(
          "rounded-full object-cover shrink-0 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-tr from-[#0e2d5c] via-indigo-700 to-blue-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs border border-white/20 select-none",
        className
      )}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
