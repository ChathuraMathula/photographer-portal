"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Search, MapPin, ChevronDown } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ city: string; district: string; display: string }>>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch cities/districts from Nominatim based on query string
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=lk&featuretype=settlement&format=json&addressdetails=1&limit=8`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const results = data.map((item: any) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.suburb || addr.village || item.name || "";
          const district = addr.county || addr.state || "";
          const display = [city, district].filter(Boolean).join(", ");
          return { city, district, display };
        }).filter((item: any) => item.city);

        // Deduplicate
        const unique = Array.from(new Map(results.map((r: any) => [r.display, r])).values()) as any;
        setSuggestions(unique);
      }
    } catch (err) {
      console.error("Nominatim suggestion fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced typing handler
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 450);
  };

  const hasValue = cityValue && districtValue;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selector Trigger Button (50px height) */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full h-[50px] px-4 border rounded-xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between text-body-small cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-dark ${
          error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <span className={`truncate font-medium ${hasValue ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
          {hasValue ? `${cityValue}, ${districtValue}` : "Search City & District..."}
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
              onChange={handleTyping}
              placeholder="Type city or district (e.g. Kandy)..."
              className="w-full h-11 pl-9 pr-3 text-xs bg-transparent outline-none focus:none font-medium text-zinc-900 dark:text-white"
              autoFocus
            />
            {loading ? (
              <Loader2 className="absolute left-3 top-3.5 h-3.5 w-3.5 animate-spin text-zinc-400" />
            ) : (
              <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-400" />
            )}
          </div>

          {/* List Options */}
          <div className="max-h-52 overflow-y-auto py-1 text-left text-xs text-zinc-700 dark:text-zinc-300">
            {suggestions.length > 0 ? (
              suggestions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelect(opt.city, opt.district);
                    setOpen(false);
                    setSearchTerm("");
                    setSuggestions([]);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-2 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate font-medium">{opt.display}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-zinc-400 italic">
                {searchTerm.length < 2 ? "Type to search locations..." : "No places found."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
