import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardLayout } from "./CardLayout";
import { RoleBadge } from "./RoleBadge";
import { SEED_ACCOUNTS } from "../constants";
import { SeedAccount } from "../types";

type AuthorizationGateProps = {
  selectSeedAccount: (acc: SeedAccount) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPass: string;
  setLoginPass: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  loggingIn: boolean;
  authError: string;
  authSuccess: string;
};

export function AuthorizationGate({
  selectSeedAccount,
  loginEmail,
  setLoginEmail,
  loginPass,
  setLoginPass,
  handleLogin,
  loggingIn,
  authError,
  authSuccess
}: AuthorizationGateProps) {
  return (
    <CardLayout title="Authorization Gate (Quick Log-In)" desc="Select a seeded role to automatically login and write session cookies.">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SEED_ACCOUNTS.map((acc, i) => (
          <button
            key={i}
            onClick={() => selectSeedAccount(acc)}
            className="flex flex-col items-center justify-between text-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer transition-all hover:border-zinc-350 active:scale-[0.98]"
          >
            <RoleBadge role={acc.role} />
            <span className="text-body-caption text-zinc-405 mt-2 truncate max-w-full font-semibold">{acc.name}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-4 space-y-4">
        <h4 className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Custom Auth Credentials</h4>
        <form onSubmit={handleLogin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5 space-y-1.5">
            <Label htmlFor="custom-email" className="text-body-caption text-zinc-500">Email address</Label>
            <Input 
              id="custom-email" 
              type="email"
              placeholder="user@example.com" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="sm:col-span-5 space-y-1.5">
            <Label htmlFor="custom-pass" className="text-body-caption text-zinc-500">Password</Label>
            <Input 
              id="custom-pass" 
              type="password"
              placeholder="••••••••" 
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Button 
              type="submit" 
              disabled={loggingIn}
              className="btn btn-primary h-10 w-full px-0 py-0 min-w-0 md:min-w-0 text-body-small-s shadow-sm"
            >
              {loggingIn ? "..." : "Log In"}
            </Button>
          </div>
        </form>
        {authError && (
          <p className="text-body-caption font-semibold text-red-650 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/30">
            <XCircle className="h-3.5 w-3.5 shrink-0" /> {authError}
          </p>
        )}
        {authSuccess && (
          <p className="text-body-caption font-semibold text-emerald-650 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-200/30">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {authSuccess}
          </p>
        )}
      </div>
    </CardLayout>
  );
}
