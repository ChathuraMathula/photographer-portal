import { Lock, Play } from "lucide-react";
import { CardLayout } from "./CardLayout";
import { MethodBadge } from "./MethodBadge";
import { ENDPOINTS } from "../constants";
import { Endpoint } from "../types";

type EndpointDirectoryProps = {
  activeCategory: Endpoint["category"];
  setActiveCategory: (cat: Endpoint["category"]) => void;
  prefillPlayground: (ep: Endpoint) => void;
};

export function EndpointDirectory({
  activeCategory,
  setActiveCategory,
  prefillPlayground
}: EndpointDirectoryProps) {
  return (
    <CardLayout 
      title="API Endpoint Directory" 
      desc="Select category and browse available backend routes, inputs and access permissions."
      headerAction={
        <div className="flex flex-wrap gap-1 border border-zinc-150 dark:border-zinc-855 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
          {(["Auth & Health", "Public Bookings", "Photographer Profile", "Packages", "Reservations", "Users"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-body-caption font-semibold cursor-pointer transition-colors ${
                activeCategory === cat 
                  ? "bg-white dark:bg-zinc-900 text-primary-dark dark:text-white shadow-sm border border-zinc-200/55 dark:border-zinc-800/55" 
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        {ENDPOINTS.filter(ep => ep.category === activeCategory).map((ep, i) => (
          <div 
            key={i} 
            className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/50 p-4 space-y-3 shadow-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <MethodBadge method={ep.method} />
                <code className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 font-mono select-all bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-150/40">
                  {ep.path}
                </code>
              </div>
              <span className="text-body-caption font-semibold flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-650 dark:text-zinc-400">
                <Lock className="h-2.5 w-2.5" />
                {ep.access}
              </span>
            </div>

            <p className="text-body-small text-zinc-555 dark:text-zinc-400">{ep.description}</p>
            
            <div className="flex items-center justify-between pt-1">
              <div className="text-body-caption text-zinc-405 font-medium">
                {ep.defaultBody && <span>📥 Payload template available</span>}
                {!ep.defaultBody && ep.defaultQuery && <span>🔍 Query keys: {ep.defaultQuery.map(q => q.key).join(", ")}</span>}
                {!ep.defaultBody && !ep.defaultQuery && <span>⚡ Simple request</span>}
              </div>
              <button
                onClick={() => prefillPlayground(ep)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-body-caption font-semibold shadow-sm cursor-pointer transition-colors"
              >
                <Play className="h-3 w-3 fill-current" /> Use in Tester
              </button>
            </div>
          </div>
        ))}
      </div>
    </CardLayout>
  );
}
