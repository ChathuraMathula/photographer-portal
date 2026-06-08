"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Sub-components for different roles ---

function SuperAdminView() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">142</p>
        </CardContent>
      </Card>
      {/* Super Admins see everything */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-emerald-500 font-bold">All Systems Nominal</p>
        </CardContent>
      </Card>
    </div>
  );
}

function PhotographerView() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pending Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-amber-500">3</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shoots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">5</p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page Component ---

export default function DashboardPage() {
  // Pull the user data from Redux!
  const { firstName, role, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  console.log(isAuthenticated)
  
  // Fallback while Redux is loading (or if they bypassed middleware somehow)
  if (!isAuthenticated) return <div className="p-8">Loading profile...</div>;

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Universal Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back, {firstName}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Logged in as: <span className="font-semibold">{role}</span>
            </p>
          </div>
        </header>

        {/* Dynamic Rendering Based on Role */}
        <section>
          {role === UserRole.SUPER_ADMIN && <SuperAdminView />}
          {role === UserRole.PHOTOGRAPHER && <PhotographerView />}
        </section>
      </div>
    </main>
  );
}
