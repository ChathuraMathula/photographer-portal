"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // e.g. 4.8
  count?: number; // e.g. 12
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (rating: number) => void;
  showScoreText?: boolean;
}

export function StarRating({
  rating,
  count,
  interactive = false,
  size = "md",
  onRate,
  showScoreText = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  const handleStarClick = (starValue: number) => {
    if (interactive && onRate) {
      onRate(starValue);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.round(currentDisplay);
          const isHalf =
            !isFilled &&
            starIndex - 0.5 <= currentDisplay &&
            starIndex > currentDisplay;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform p-0.5 focus:outline-none`}
            >
              <Star
                className={`${starSizes[size]} ${
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : isHalf
                    ? "fill-amber-200 text-amber-400"
                    : "fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700"
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showScoreText && (
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-800 dark:text-zinc-200">
          <span>{Number(rating).toFixed(1)}</span>
          {count !== undefined && (
            <span className="text-zinc-400 font-normal">({count})</span>
          )}
        </div>
      )}
    </div>
  );
}
