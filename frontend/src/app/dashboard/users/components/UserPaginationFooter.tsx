import React from "react";
import { Pagination } from "@/components/ui/pagination";

interface UserPaginationFooterProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function UserPaginationFooter({
  page,
  totalPages,
  total,
  onPageChange,
}: UserPaginationFooterProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-sm gap-4">
      <div className="text-body-caption text-zinc-500">
        Showing page{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {totalPages}
        </span>{" "}
        ({total} total users)
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
