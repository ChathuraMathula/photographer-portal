import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

type Props = {
  firstName: string;
  role: string;
  onLogout: () => void;
};

export function AdminDashboard({ firstName, role, onLogout }: Props) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Admin Portal
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Welcome back, {firstName} ·{" "}
              <span className="font-semibold">{role}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/dashboard/users")}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              User Management
            </Button>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-zinc-500 hover:text-zinc-700"
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-zinc-500 dark:text-zinc-400 text-sm">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">Active &amp; Sync</p>
              <p className="text-xs text-zinc-400 mt-1">
                PostgreSQL DB connected successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-zinc-500 dark:text-zinc-400 text-sm">
                Local Maildev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="http://localhost:1080"
                target="_blank"
                rel="noreferrer"
                className="text-3xl font-bold text-indigo-500 hover:underline block"
              >
                Go to Maildev
              </a>
              <p className="text-xs text-zinc-400 mt-1">
                Check outgoing bookings emails locally
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-zinc-500 dark:text-zinc-400 text-sm">
                Local pgAdmin ERD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="http://localhost:5050"
                target="_blank"
                rel="noreferrer"
                className="text-3xl font-bold text-amber-500 hover:underline block"
              >
                pgAdmin Web UI
              </a>
              <p className="text-xs text-zinc-400 mt-1">
                Visual diagram on port 5050
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 p-8 text-center bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-bold mb-2">
            Create &amp; Manage User Accounts
          </h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-lg mx-auto">
            You have access to create system users. Super Admins can add Admins
            and Photographers. Admins can create Photographers only.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/dashboard/users")}
            className="px-8"
          >
            Open User Management
          </Button>
        </Card>
      </div>
    </main>
  );
}
