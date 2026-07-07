"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: values.email }),
        });

        if (!res.ok) {
          throw new Error("Failed to send reset link");
        }

        setSuccess(true);
        toast.success(
          "If the email exists, a password reset link has been sent!",
        );
      } catch (err: any) {
        toast.error(err.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <span className="text-[10px] font-bold tracking-widest text-zinc-450 uppercase">
            Security
          </span>
        </div>

        <Card className="border border-zinc-200/60 dark:border-zinc-800/80 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="pb-6">
            <CardTitle className="text-title-large text-zinc-900 dark:text-white font-extrabold">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-body-small text-zinc-500 dark:text-zinc-400 mt-2">
              Enter your account email below. If it exists in the system, we
              will send you a password reset link.
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
                    Reset Link Dispatched
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-500 leading-relaxed font-medium">
                    Please check your mailbox (including Maildev at
                    localhost:1080) for instructions to complete your password
                    update.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      {...formik.getFieldProps("email")}
                      className={`h-11 rounded-xl pr-10 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark focus:border-primary-dark dark:bg-zinc-950 ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-body-caption text-red-500 mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <Button
                  className="btn btn-primary w-full h-11 rounded-xl text-body-small-s font-semibold shadow-md cursor-pointer transition-all mt-6"
                  type="submit"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="bg-zinc-50 dark:bg-zinc-950/40 px-6 py-4 border-t border-zinc-150/40 dark:border-zinc-850/60 flex justify-center">
            <p className="text-[11px] text-zinc-400">
              Need assistance? Contact support@photoportal.com
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
