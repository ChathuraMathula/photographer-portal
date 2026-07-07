import React from "react";
import { Loader2, Search, MapPin } from "lucide-react";

type Props = {
  searchTerm: string;
  loading: boolean;
  suggestions: Array<{ city: string; district: string; display: string }>;
  onTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOption: (city: string, district: string) => void;
};

export function NominatimDropdown({ searchTerm, loading, suggestions, onTyping, onSelectOption }: Props) {
  return (
    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="relative border-b border-zinc-100 dark:border-zinc-800">
        <input
          type="text"
          value={searchTerm}
          onChange={onTyping}
          placeholder="Type city or district (e.g. Kandy)..."
          className="w-full h-11 pl-9 pr-3 text-xs bg-transparent outline-none focus:none font-medium text-zinc-900 dark:text-white"
          autoFocus
        />
        {loading ? <Loader2 className="absolute left-3 top-3.5 h-3.5 w-3.5 animate-spin text-zinc-400" /> : <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-400" />}
      </div>
      <div className="max-h-52 overflow-y-auto py-1 text-left text-xs text-zinc-700 dark:text-zinc-300">
        {suggestions.length > 0 ? (
          suggestions.map((opt, i) => (
            <button key={i} type="button" onClick={() => onSelectOption(opt.city, opt.district)} className="w-full px-3 py-3 flex items-center gap-2 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors text-left cursor-pointer">
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
  );
}
