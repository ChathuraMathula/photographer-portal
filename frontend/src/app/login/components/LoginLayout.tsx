import React, { Suspense } from "react";
import { BrandLogo } from "./BrandLogo";
import { LoginBanner } from "./LoginBanner";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 relative">
      <BrandLogo />

      {/* Left Column: Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:py-24 md:px-16 lg:px-24 bg-white dark:bg-zinc-900 rounded-t-3xl -mt-6 md:mt-0 relative z-10 md:rounded-none md:bg-transparent md:dark:bg-transparent order-last md:order-first">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <Suspense fallback={<div className="p-4 text-center text-xs text-zinc-400">Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </div>

      {/* Right Column: Visual Banner */}
      <LoginBanner />
    </main>
  );
}
