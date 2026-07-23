import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TrackingErrorStateProps {
  error: string;
  token: string;
  onResetEmail: () => void;
}

export function TrackingErrorState({
  error,
  token,
  onResetEmail,
}: TrackingErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>{error || "Reservation not found"}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              localStorage.removeItem(`verified_email_res_${token}`);
              onResetEmail();
            }}
          >
            Try Different Email
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
