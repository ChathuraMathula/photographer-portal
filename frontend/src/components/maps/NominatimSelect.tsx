"use client";
import React from "react";
import { ChevronDown } from "lucide-react";
import { useNominatimSearch } from "./hooks/useNominatimSearch";
import { NominatimDropdown } from "./components/NominatimDropdown";

type NominatimSelectProps = {
  cityValue: string;
  districtValue: string;
  onSelect: (city: string, district: string) => void;
  error?: string;
};

export function NominatimSelect({
  cityValue,
  districtValue,
  onSelect,
  error,
}: NominatimSelectProps) {
  const {
    open,
    setOpen,
    searchTerm,
    setSearchTerm,
    suggestions,
    setSuggestions,
    loading,
    containerRef,
    handleTyping,
  } = useNominatimSearch();
  const hasValue = cityValue && districtValue;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-[50px] px-4 border rounded-xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between text-body-small cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-dark ${error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"}`}
      >
        <span
          className={`truncate font-medium ${hasValue ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}
        >
          {hasValue
            ? `${cityValue}, ${districtValue}`
            : "Search City & District..."}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <NominatimDropdown
          searchTerm={searchTerm}
          loading={loading}
          suggestions={suggestions}
          onTyping={handleTyping}
          onSelectOption={(city, dist) => {
            onSelect(city, dist);
            setOpen(false);
            setSearchTerm("");
            setSuggestions([]);
          }}
        />
      )}
    </div>
  );
}
