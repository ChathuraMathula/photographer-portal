"use client";

import { useState } from "react";
import { Lock, Play, Search, X } from "lucide-react";
import { CardLayout } from "./CardLayout";
import { MethodBadge } from "./MethodBadge";
import { CATEGORIES, ENDPOINTS } from "../constants";
import { Endpoint } from "../types";

type EndpointDirectoryProps = {
  activeCategory: Endpoint["category"];
  setActiveCategory: (cat: Endpoint["category"]) => void;
  prefillPlayground: (ep: Endpoint) => void;
};

const CATEGORY_COUNTS = Object.fromEntries(
  CATEGORIES.map((cat) => [
    cat,
    ENDPOINTS.filter((ep) => ep.category === cat).length,
  ]),
);

export function EndpointDirectory({
  activeCategory,
  setActiveCategory,
  prefillPlayground,
}: EndpointDirectoryProps) {
  const [search, setSearch] = useState("");

  const filtered = ENDPOINTS.filter(
    (ep) =>
      ep.category === activeCategory &&
      (ep.path.toLowerCase().includes(search.toLowerCase()) ||
        ep.description.toLowerCase().includes(search.toLowerCase()) ||
        ep.method.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <CardLayout
      title="API Endpoint Directory"
      desc="Browse all backend routes, access requirements, and parameters. Click 'Use in Tester' to prefill the playground."
    >
      {/* Category tab bar — horizontal scroll on mobile */}
      <div className="mb-4 -mx-1 overflow-x-auto">
        <div className="flex gap-1.5 px-1 pb-1 min-w-max">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearch("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-caption font-semibold cursor-pointer transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {cat}
              <span
                className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none ${
                  activeCategory === cat
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900"
                    : "bg-zinc-150 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {CATEGORY_COUNTS[cat]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search within category */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeCategory} endpoints…`}
          className="w-full h-9 pl-9 pr-8 text-body-caption border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Endpoint list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-body-small text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No endpoints match &ldquo;{search}&rdquo;
          </div>
        ) : (
          filtered.map((ep, i) => (
            <div
              key={i}
              className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/50 p-4 space-y-3 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow"
            >
              {/* Path + access row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <MethodBadge method={ep.method} />
                  <code className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 font-mono select-all bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-150/40 break-all">
                    {ep.path}
                  </code>
                </div>
                <span className="self-start sm:self-auto shrink-0 text-body-caption font-semibold flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-650 dark:text-zinc-400 whitespace-nowrap">
                  <Lock className="h-2.5 w-2.5" />
                  {ep.access}
                </span>
              </div>

              <p className="text-body-small text-zinc-555 dark:text-zinc-400 leading-relaxed">
                {ep.description}
              </p>

              {/* Footer row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-850">
                <div className="text-body-caption text-zinc-405 font-medium">
                  {ep.defaultBody && <span>📥 Payload template available</span>}
                  {!ep.defaultBody && ep.defaultQuery && (
                    <span>
                      🔍 Query keys:{" "}
                      {ep.defaultQuery.map((q) => q.key).join(", ")}
                    </span>
                  )}
                  {!ep.defaultBody && !ep.defaultQuery && (
                    <span>⚡ Simple request — no body required</span>
                  )}
                </div>
                <button
                  onClick={() => prefillPlayground(ep)}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-body-caption font-semibold shadow-sm cursor-pointer transition-colors shrink-0"
                >
                  <Play className="h-3 w-3 fill-current" /> Use in Tester
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </CardLayout>
  );
}
