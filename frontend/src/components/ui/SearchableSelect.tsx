"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

type Option = {
  name: string;
  value: string;
};

type SearchableSelectProps = {
  options: Option[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search term when opening/closing
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selector Trigger Button (Explicitly 50px height) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full h-[50px] px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between text-body-small text-zinc-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-700 shadow-sm"
      >
        <span className="truncate font-medium">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Content */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Search box input */}
          <div className="relative border-b border-zinc-100 dark:border-zinc-800">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-9 pr-3 text-xs bg-transparent outline-none focus:none font-medium text-zinc-900 dark:text-white"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
          </div>

          {/* List Options */}
          <div className="max-h-52 overflow-y-auto py-1 text-left text-xs text-zinc-700 dark:text-zinc-300">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer ${
                      isSelected ? "bg-zinc-50 dark:bg-zinc-850 font-bold text-zinc-900 dark:text-white" : ""
                    }`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-white shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-center text-zinc-400 italic">
                No matching results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
