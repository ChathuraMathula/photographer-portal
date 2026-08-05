"use client";

import React, { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { X, Star, CheckCircle2 } from "lucide-react";
import { PhotographerProfileItem } from "../types";

interface RatingModalProps {
  photographer: PhotographerProfileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (profileId: string, rating: number) => Promise<void>;
}

export function RatingModal({
  photographer,
  isOpen,
  onClose,
  onSubmitRating,
}: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !photographer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmitRating(photographer.id, selectedRating);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const photographerName = photographer.user
    ? `${photographer.user.firstName} ${photographer.user.lastName}`
    : "Photographer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Rating Submitted!
            </h3>
            <p className="text-xs text-zinc-500">
              Thank you for rating {photographerName}. Your feedback helps our community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1 text-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Rate {photographerName}
              </h3>
              <p className="text-xs text-zinc-500">
                Select your rating score from 1 to 5 stars.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-2">
              <StarRating
                rating={selectedRating}
                interactive={true}
                size="lg"
                onRate={(val) => setSelectedRating(val)}
                showScoreText={false}
              />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {selectedRating} out of 5 Stars
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2 h-11 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-1/2 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
              >
                {submitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
