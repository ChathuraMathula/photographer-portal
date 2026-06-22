import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type Props = {
  emailInput: string;
  verifying: boolean;
  verificationError: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function EmailVerificationScreen({
  emailInput,
  verifying,
  verificationError,
  onEmailChange,
  onSubmit,
}: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Access Verification
          </CardTitle>
          <CardDescription>
            For security reasons, please enter your email address to access this
            reservation.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {verificationError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{verificationError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify and Access"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
