import React, { useState } from "react";
import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  formik: any;
  apiError: string;
};

export function LoginForm({ formik, apiError }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      <div className="space-y-3 text-center md:text-left mt-8 md:mt-0">
        <h1 className="text-title-large text-primary-dark dark:text-white leading-tight">
          Access your photographer portal
        </h1>
        <p className="text-body-small text-zinc-500 dark:text-zinc-400">
          Manage reservations, proposals, and chat with customers in real-time.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {apiError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
            {apiError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...formik.getFieldProps("email")}
            className={`h-11 md:h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
              formik.touched.email && formik.errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-body-caption text-red-500 mt-1">{formik.errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...formik.getFieldProps("password")}
              className={`h-11 md:h-12 pr-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
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
            <p className="text-body-caption text-red-500 mt-1">{formik.errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-body-small-s font-semibold text-primary-dark hover:underline dark:text-primary-light transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button
          className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none"
          type="submit"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
