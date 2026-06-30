import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push("ellipsis-1");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("ellipsis-2");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center gap-1.5", className)}
    >
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={page === 1}
        className="h-9 w-9 p-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 cursor-pointer flex items-center justify-center"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((item, index) => {
        if (typeof item === "string") {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-zinc-400 dark:text-zinc-550 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
          );
        }

        const isCurrent = item === page;

        return (
          <Button
            key={item}
            variant={isCurrent ? "default" : "outline"}
            onClick={() => onPageChange(item)}
            className={cn(
              "h-9 w-9 p-0 rounded-lg text-xs font-semibold shrink-0 cursor-pointer flex items-center justify-center",
              isCurrent
                ? "bg-primary text-white"
                : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {item}
          </Button>
        );
      })}

      <Button
        variant="outline"
        onClick={handleNext}
        disabled={page === totalPages}
        className="h-9 w-9 p-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 cursor-pointer flex items-center justify-center"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
