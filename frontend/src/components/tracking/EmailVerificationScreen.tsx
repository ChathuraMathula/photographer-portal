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
      <Card className="w-full max-w-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-title-large text-primary-dark dark:text-white">
            Access Verification
          </CardTitle>
          <CardDescription className="text-body-small text-zinc-500 mt-1.5">
            For security reasons, please enter your email address to access this
            reservation.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {verificationError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-body-small-s text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-250/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-body-small-s">{verificationError}</p>
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
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none h-11 py-0 shadow-sm"
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
