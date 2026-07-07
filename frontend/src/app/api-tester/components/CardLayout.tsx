import React from "react";

type CardLayoutProps = {
  title: string;
  desc: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
};

export function CardLayout({
  title,
  desc,
  children,
  headerAction,
}: CardLayoutProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-855 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/10">
        <div>
          <h3 className="text-title-medium text-primary-dark dark:text-white font-bold">
            {title}
          </h3>
          <p className="text-body-small text-zinc-555 mt-0.5">{desc}</p>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
      <div className="p-4 sm:p-6 space-y-4">{children}</div>
    </div>
  );
}
