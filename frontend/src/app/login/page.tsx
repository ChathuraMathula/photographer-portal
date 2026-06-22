"use client";

import { useState } from "react";
import { useLogin } from "./hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { formik, apiError } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 relative">
      
      {/* Brand logo (floating on mobile, static on desktop) */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 md:bg-transparent md:dark:bg-transparent md:shadow-none md:border-none md:p-0 md:left-12 md:top-10">
        <span className="h-7 w-7 rounded-full bg-[#2d4a43] flex items-center justify-center text-white font-bold text-sm shadow-inner">P</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-bold tracking-tight text-sm sm:text-base">
          Photographer Portal
        </span>
      </div>

      {/* Left Column: Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:py-24 md:px-16 lg:px-24 bg-white dark:bg-zinc-900 rounded-t-3xl -mt-6 md:mt-0 relative z-10 md:rounded-none md:bg-transparent md:dark:bg-transparent order-last md:order-first">
        <div className="w-full max-w-sm mx-auto space-y-8">
          
          <div className="space-y-3 text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Access your photographer portal
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage reservations, proposals, and chat with customers in real-time.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {apiError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                {apiError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...formik.getFieldProps("email")}
                className={`h-11 md:h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-[#2d4a43] focus:border-[#2d4a43] dark:bg-zinc-950 ${
                  formik.touched.email && formik.errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...formik.getFieldProps("password")}
                  className={`h-11 md:h-12 pr-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-[#2d4a43] focus:border-[#2d4a43] dark:bg-zinc-950 ${
                    formik.touched.password && formik.errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs sm:text-sm font-semibold text-[#2d4a43] hover:text-[#1f332e] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              className="w-full h-11 md:h-12 rounded-xl text-base font-semibold bg-[#2d4a43] hover:bg-[#1f332e] text-white transition-colors duration-200 shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-700"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Column: Visual Banner */}
      <div className="w-full h-[40vh] md:h-screen md:w-1/2 relative bg-zinc-900 overflow-hidden order-first md:order-last">
        <Image
          src="/login-banner.png"
          alt="Photographer Portal Professional Studio"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-90 transition-transform duration-10000 hover:scale-105"
        />
        {/* Subtle decorative gradient overlay to add depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

    </main>
  );
}
