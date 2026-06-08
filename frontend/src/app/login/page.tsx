"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 1. Define Yup Validation Rules
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch(); // Hook to send data to Redux

  // 2. Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: "admin@photoportal.com",
      password: "SuperSecret123!",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError("");

      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // 3. Send the user data to our Global Redux Store
        dispatch(
          setCredentials({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            firstName: data.user.firstName,
          }),
        );

        // 4. Redirect to the newly protected dashboard!
        router.push("/dashboard");
      } catch (err: unknown) {
        if (err instanceof Error) setApiError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 sm:p-8 dark:bg-zinc-950">
      <Card className="w-full max-w-sm shadow-lg md:max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Enter your credentials
          </CardDescription>
        </CardHeader>

        {/* Bind formik.handleSubmit to the form */}
        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-4">
            {apiError && (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-500 dark:bg-red-900/30">
                {apiError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")} // Automatically binds onChange, onBlur, value
                className={`h-10 md:h-12 ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
              />
              {/* Show Yup validation errors */}
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...formik.getFieldProps("password")}
                className={`h-10 md:h-12 ${formik.touched.password && formik.errors.password ? "border-red-500" : ""}`}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500">{formik.errors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full md:h-12 md:text-lg"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
