import React from "react";

export function ReservationListItemSkeleton() {
  return (
    <div className="p-4 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
      </div>
    </div>
  );
}
