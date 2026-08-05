"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LoginLayout } from "../../login/components/LoginLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldX, Camera, Building2, ShieldCheck, User, ArrowRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

function PortalLoginForm() {
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const isDeactivated = searchParams.get("deactivated") === "true";

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError("");

      try {
        const response = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        dispatch(
          setCredentials({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            firstName: data.user.firstName,
          }),
        );

        router.push("/dashboard");
      } catch (err: unknown) {
        if (err instanceof Error) setApiError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#0e2d5c] dark:text-indigo-300 border border-indigo-200/60 text-[11px] font-bold">
          <Building2 className="h-3.5 w-3.5" />
          Provider & Partner Portal
        </div>
        <h1 className="text-title-large text-primary-dark dark:text-white leading-tight">
          Partner Portal Sign In
        </h1>
        <p className="text-body-small text-zinc-500 dark:text-zinc-400">
          Sign in for Photographers, Studio Owners, Studio Staff, and Administrators.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {isDeactivated && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 border border-red-200/60 dark:border-red-900/40 flex items-start gap-3">
            <ShieldX className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-body-small-s font-bold text-red-700 dark:text-red-400">
                Account Suspended
              </p>
              <p className="text-body-caption text-red-600 dark:text-red-500 mt-0.5">
                Your account has been deactivated by an administrator. Please contact support.
              </p>
            </div>
          </div>
        )}

        {apiError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-body-small-s text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
            {apiError}
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="provider@example.com"
            {...formik.getFieldProps("email")}
            className={`h-11 md:h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-body-caption text-red-500 mt-1">
              {formik.errors.email as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...formik.getFieldProps("password")}
              className={`h-11 md:h-12 pr-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : ""
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
            <p className="text-body-caption text-red-500 mt-1">
              {formik.errors.password as string}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href="/forgot-password"
            className="text-body-small-s font-semibold text-primary-dark hover:underline dark:text-primary-light transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none h-11 md:h-12 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
          type="submit"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Signing in..." : "Partner Sign In"}
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center md:text-left">
          Are you a customer?
        </p>
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all group"
        >
          <span className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Customer Portal Sign In
          </span>
          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <LoginLayout>
      <PortalLoginForm />
    </LoginLayout>
  );
}
