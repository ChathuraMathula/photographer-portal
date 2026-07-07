import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { type UserAccount } from "@/types";

type Props = {
  user: UserAccount;
  onClose: () => void;
  onSuccess: (updatedUser: { firstName: string; lastName: string; bookingSlug: string }) => void;
};

export function EditUserDetailsModal({ user, onClose, onSuccess }: Props) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [slug, setSlug] = useState(user.profile?.bookingSlug || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and Last name cannot be empty.");
      return;
    }
    
    // For photographers, slug is required. For others, it might be empty
    if (user.role === "PHOTOGRAPHER" && !slug.trim()) {
      setError("Slug cannot be empty for photographers.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
      const res = await fetch(`${API}/users/${user.id}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          bookingSlug: slug 
        }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 409) {
          setError("This booking slug is already taken. Please choose another one.");
        } else {
          setError("Failed to update user details.");
        }
        return;
      }

      const data = await res.json();
      toast.success("User details updated successfully!");
      onSuccess(data);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-zinc-800">
          <h2 className="text-title-medium font-bold text-primary-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Edit User Details
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-650 rounded-xl border border-red-200/50 text-body-small-s dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-body-small-s font-semibold">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-body-small-s font-semibold">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {user.role === "PHOTOGRAPHER" && (
              <div className="space-y-2">
                <Label htmlFor="bookingSlug" className="text-body-small-s font-semibold">
                  Photographer Booking Slug
                </Label>
                <Input
                  id="bookingSlug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. john-doe"
                  className="h-11 rounded-xl"
                />
                <p className="text-body-caption text-zinc-500 dark:text-zinc-400">
                  This forms the booking URL (e.g. /book/{slug || "slug"})
                </p>
              </div>
            )}
          </div>

          <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 py-0 shadow-sm btn-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !firstName || !lastName || (user.role === "PHOTOGRAPHER" && !slug)}
              className="h-11 py-0 shadow-sm btn-primary gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
