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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-title-large text-primary-dark dark:text-white">
              Admin Portal
            </h1>
            <p className="text-body-small text-zinc-500 mt-1">
              Welcome back, {firstName} ·{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-205">{role}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/dashboard/users")}
              className="btn btn-primary h-10 px-4 py-0 min-w-0 md:min-w-0 text-sm shadow-sm"
            >
              User Management
            </Button>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="btn btn-secondary h-10 px-4 py-0 min-w-0 md:min-w-0 text-sm shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-small-s font-semibold text-zinc-550 dark:text-zinc-400">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-title-medium text-emerald-600 dark:text-emerald-400">Active &amp; Sync</p>
              <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
                PostgreSQL DB connected successfully
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-small-s font-semibold text-zinc-550 dark:text-zinc-400">
                Local Maildev
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="http://localhost:1080"
                target="_blank"
                rel="noreferrer"
                className="text-title-medium text-primary-light hover:text-primary-dark dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline block"
              >
                Go to Maildev
              </a>
              <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
                Check outgoing bookings emails locally
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-body-small-s font-semibold text-zinc-550 dark:text-zinc-400">
                Local pgAdmin ERD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="http://localhost:5050"
                target="_blank"
                rel="noreferrer"
                className="text-title-medium text-primary-light hover:text-primary-dark dark:text-amber-400 dark:hover:text-amber-300 hover:underline block"
              >
                pgAdmin Web UI
              </a>
              <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
                Visual diagram on port 5050
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 p-8 text-center bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <h2 className="text-title-medium text-primary-dark dark:text-white mb-2">
            Create &amp; Manage User Accounts
          </h2>
          <p className="text-body-small text-zinc-500 mb-6 max-w-lg mx-auto leading-relaxed">
            You have access to create system users. Super Admins can add Admins
            and Photographers. Admins can create Photographers only.
          </p>
          <Button
            onClick={() => router.push("/dashboard/users")}
            className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-8 shadow-sm"
          >
            Open User Management
          </Button>
        </Card>
      </div>
    </main>
  );
}
