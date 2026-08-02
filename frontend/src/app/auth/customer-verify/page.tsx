"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials, UserRole } from "@/store/slices/authSlice";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function CustomerVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No magic link token provided.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
        const res = await fetch(`${API}/auth/customer/verify-magic-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to verify magic link");

        const customer = data.customer;
        dispatch(
          setCredentials({
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName || "Customer",
            role: UserRole.CUSTOMER,
            isProfileCompleted: customer.isProfileCompleted,
          }),
        );

        if (!customer.isProfileCompleted) {
          router.push("/customer/complete-profile");
        } else {
          router.push("/customer/dashboard");
        }
      } catch (err: any) {
        setError(err.message || "Invalid or expired sign-in link.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, dispatch, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl text-center space-y-4">
        {loading ? (
          <div className="space-y-3 py-6">
            <Loader2 className="h-10 w-10 text-[#0e2d5c] dark:text-blue-400 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Verifying Sign-in Link...
            </h2>
            <p className="text-xs text-zinc-500">
              Please wait while we log you into your customer portal.
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400 mx-auto" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
            <Link
              href="/login"
              className="inline-block text-xs font-bold text-[#0e2d5c] dark:text-blue-400 hover:underline pt-2"
            >
              Return to Customer Login
            </Link>
          </div>
        ) : (
          <div className="space-y-3 py-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Verified! Redirecting...
            </h2>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CustomerVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerVerifyContent />
    </Suspense>
  );
}
