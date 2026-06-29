"use client";

import React from "react";
import { Check, Copy } from "lucide-react";

export type Account = {
  role: string;
  name: string;
  email: string;
  password: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

type Props = {
  account: Account;
  index: number;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
};

export function AccountRow({ account, index, copiedId, onCopy }: Props) {
  return (
    <div className="p-6 flex flex-col md:flex-row md:items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
      {/* Icon wrapper */}
      <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl ${account.iconBg} ${account.iconColor}`}>
        {account.icon}
      </div>

      {/* Details */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${account.iconBg} ${account.iconColor}`}>
            {account.role}
          </span>
          <h4 className="text-body-small-bold font-bold text-zinc-900 dark:text-white">
            {account.name}
          </h4>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pt-0.5">
          {account.description}
        </p>

        {/* Credentials blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          {/* Email */}
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/30 dark:border-zinc-850 p-2.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase select-none">
              Email
            </span>
            <span className="text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 font-mono pl-2 truncate flex-1 text-right pr-2">
              {account.email}
            </span>
            <button
              onClick={() => onCopy(account.email, `${index}-email`)}
              className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-750 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy email"
            >
              {copiedId === `${index}-email` ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/30 dark:border-zinc-850 p-2.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase select-none">
              Password
            </span>
            <span className="text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 font-mono pl-2 truncate flex-1 text-right pr-2">
              {account.password}
            </span>
            <button
              onClick={() => onCopy(account.password, `${index}-password`)}
              className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-750 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy password"
            >
              {copiedId === `${index}-password` ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
