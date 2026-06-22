"use client";

import { useLogin } from "./hooks/useLogin";
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

export default function LoginPage() {
  const { formik, apiError } = useLogin();

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
