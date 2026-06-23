import React from "react";

export function BrandLogo() {
  return (
    <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 md:bg-transparent md:dark:bg-transparent md:shadow-none md:border-none md:p-0 md:left-12 md:top-10">
      <span className="h-7 w-7 rounded-full bg-primary-dark flex items-center justify-center text-white font-bold text-body-small-s shadow-inner">P</span>
      <span className="text-zinc-900 dark:text-zinc-100 font-bold tracking-tight text-body-small-s md:text-body-small">
        Photographer Portal
      </span>
    </div>
  );
}
