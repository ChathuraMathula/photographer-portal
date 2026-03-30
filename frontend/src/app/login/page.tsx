"use client";

import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Notice: We added 'credentials: "include"' here!
      // This tells the browser to accept and store cookies sent by our backend.
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log(data)

      console.log("Login Successful! Check your browser cookies.", data.user);
      // TODO: Redirect user to the dashboard
    } catch (err: unknown) {
      // Strictly typing the error instead of using 'any'
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 sm:p-8 dark:bg-zinc-950">
      <Card className="w-full max-w-sm shadow-lg md:max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-500 dark:bg-red-900/30">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@photoportal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 md:h-12" // Larger touch target on tablets/desktop
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 md:h-12"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full md:h-12 md:text-lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
