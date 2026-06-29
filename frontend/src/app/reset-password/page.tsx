"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Confirm password is required"),
});

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing password reset token");
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      if (!token) {
        toast.error("Token is missing. Cannot reset password.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API}/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: values.password,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to reset password");
        }

        setSuccess(true);
        toast.success("Password reset successfully!");
      } catch (err: any) {
        toast.error(err.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  if (!token) {
    return (
      <Card className="border border-zinc-200/60 dark:border-zinc-800/80 shadow-xl overflow-hidden bg-white dark:bg-zinc-900 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-500">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid, expired, or has already been used.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link href="/login">
            <Button className="w-full h-11 rounded-xl font-semibold btn btn-primary cursor-pointer">
              Go back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-zinc-200/60 dark:border-zinc-800/80 shadow-xl overflow-hidden bg-white dark:bg-zinc-900 w-full max-w-md">
      <CardHeader className="pb-6">
        <CardTitle className="text-title-large text-zinc-900 dark:text-white font-extrabold">
          Create New Password
        </CardTitle>
        <CardDescription className="text-body-small text-zinc-500 dark:text-zinc-400 mt-2">
          Choose a secure, strong password for your photographer portal account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center dark:bg-emerald-950/10 dark:border-emerald-900/30 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-450">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-body-small-bold font-bold text-emerald-900 dark:text-emerald-400">
                Password Updated!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-500 leading-relaxed font-medium pb-2">
                Your new password is now active. You can log in using your updated credentials.
              </p>
              <Link href="/login" className="block pt-2">
                <Button className="w-full h-11 rounded-xl font-bold bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center gap-2 cursor-pointer">
                  Go to Login <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...formik.getFieldProps("password")}
                  className={`h-11 pr-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
                    formik.touched.password && formik.errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-body-caption text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...formik.getFieldProps("confirmPassword")}
                  className={`h-11 pr-11 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-body-caption text-red-500 mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <Button
              className="btn btn-primary w-full h-11 rounded-xl text-body-small-s font-semibold shadow-md cursor-pointer transition-all mt-6"
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-950/40 px-6 py-4 border-t border-zinc-150/40 dark:border-zinc-850/60 flex justify-center text-center">
        <p className="text-[11px] text-zinc-400">
          Ensure your password contains at least 6 characters.
        </p>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <Suspense fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
