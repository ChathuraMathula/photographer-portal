"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EventTypesCardProps = {
  allowedEventTypes: string[];
  onAllowedEventTypesChange: (v: string[]) => void;
  allowCustomEventTypes: boolean;
  onAllowCustomEventTypesChange: (v: boolean) => void;
};

const PREDEFINED_EVENT_TYPES = [
  "Wedding",
  "Portrait",
  "Engagement",
  "Corporate Event",
  "Newborn",
  "Fashion",
  "Sports",
  "Landscape",
  "Event Party",
];

export function EventTypesCard({
  allowedEventTypes,
  onAllowedEventTypesChange,
  allowCustomEventTypes,
  onAllowCustomEventTypesChange,
}: EventTypesCardProps) {
  const [customTypeInput, setCustomTypeInput] = useState("");

  const handleTogglePredefinedType = (type: string) => {
    if (allowedEventTypes.includes(type)) {
      onAllowedEventTypesChange(allowedEventTypes.filter((t) => t !== type));
    } else {
      onAllowedEventTypesChange([...allowedEventTypes, type]);
    }
  };

  const handleAddCustomType = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanType = customTypeInput.trim();
    if (!cleanType) return;
    if (allowedEventTypes.some((t) => t.toLowerCase() === cleanType.toLowerCase())) {
      setCustomTypeInput("");
      return; // Already added
    }
    onAllowedEventTypesChange([...allowedEventTypes, cleanType]);
    setCustomTypeInput("");
  };

  const handleRemoveType = (type: string) => {
    onAllowedEventTypesChange(allowedEventTypes.filter((t) => t !== type));
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-zinc-900 dark:text-white">Service Offerings &amp; Event Types</CardTitle>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          Define the service types that clients can choose from in your booking availability checklist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label className="text-body-caption font-semibold text-zinc-500 uppercase tracking-wider">
            Currently Offered
          </Label>
          {allowedEventTypes.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
              <p className="text-body-caption text-zinc-400 italic">No event types defined yet. Select or add one below.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allowedEventTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1 text-body-caption font-semibold shadow-sm"
                >
                  {type}
                  <button
                    type="button"
                    onClick={() => handleRemoveType(type)}
                    className="text-zinc-400 hover:text-zinc-250 dark:text-zinc-650 dark:hover:text-zinc-850 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-body-caption font-semibold text-zinc-500 uppercase tracking-wider">
            Select Predefined Types
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_EVENT_TYPES.filter((type) => !allowedEventTypes.includes(type)).map((type) => {
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTogglePredefinedType(type)}
                  className="px-3 py-1 rounded-lg text-body-caption font-medium border transition-all cursor-pointer border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950"
                >
                  {type}
                </button>
              );
            })}
            {PREDEFINED_EVENT_TYPES.every((type) => allowedEventTypes.includes(type)) && (
              <span className="text-[11px] text-zinc-400 italic">All predefined types have been added.</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-body-caption font-semibold text-zinc-500 uppercase tracking-wider">
            Add Custom Event Type
          </Label>
          <div className="flex gap-2">
            <Input
              value={customTypeInput}
              onChange={(e) => setCustomTypeInput(e.target.value)}
              placeholder="e.g. Newborn Session, Real Estate, Food"
              className="h-11 w-full min-w-0 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 text-body-small-s"
            />
            <Button
              type="button"
              onClick={handleAddCustomType}
              className="btn btn-outline h-11 px-4 flex items-center gap-1.5 border-zinc-200 dark:border-zinc-850"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl mt-3">
          <input
            type="checkbox"
            id="allowCustomTog"
            checked={allowCustomEventTypes}
            onChange={(e) => onAllowCustomEventTypesChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 shrink-0"
          />
          <div className="space-y-0.5">
            <Label
              htmlFor="allowCustomTog"
              className="text-body-caption font-semibold text-zinc-900 dark:text-white cursor-pointer"
            >
              Allow custom client event types
            </Label>
            <p className="text-body-caption text-zinc-455 dark:text-zinc-550">
              If toggled, clients can choose an &quot;Other&quot; option in your Booking Page and define their specific event type if they cannot find it in your list.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
