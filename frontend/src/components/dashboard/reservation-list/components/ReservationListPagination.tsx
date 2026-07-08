import React from "react";

interface ReservationListPaginationProps {
  page: number;
  totalPages: number;
  setPage: (val: number) => void;
}

export function ReservationListPagination({
  page,
  totalPages,
  setPage,
}: ReservationListPaginationProps) {
  const blockSize = 3;
  const currentBlock = Math.floor((page - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const pageSlots = [startPage, startPage + 1, startPage + 2];

  return (
    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 shrink-0 flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pageSlots.map((p) => {
          const exists = p <= totalPages;
          const isCurrent = p === page;
          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              disabled={!exists}
              className={`h-7 w-7 rounded-md text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                !exists
                  ? "opacity-0 pointer-events-none"
                  : isCurrent
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="h-7 w-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
