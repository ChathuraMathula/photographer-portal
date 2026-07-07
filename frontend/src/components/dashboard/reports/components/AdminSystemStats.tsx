import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShieldAlert } from "lucide-react";

type Props = { stats: { totalPhotographers: number; totalAdmins: number; totalSuspended: number; }; };

export function AdminSystemStats({ stats }: Props) {
  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Photographers</CardTitle>
          <Users className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-zinc-900 dark:text-white">{stats.totalPhotographers} Photographers</div>
          <p className="text-[10px] text-zinc-400 mt-1">Platform service providers</p>
        </CardContent>
      </Card>
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Admins</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-zinc-900 dark:text-white">{stats.totalAdmins} Agency Admins</div>
          <p className="text-[10px] text-zinc-400 mt-1">Managing user registrations</p>
        </CardContent>
      </Card>
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Suspended Accounts</CardTitle>
          <ShieldAlert className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-title-medium font-bold text-red-650 dark:text-red-400">{stats.totalSuspended} Accounts</div>
          <p className="text-[10px] text-red-500/80 mt-1">Access revoked by super admins</p>
        </CardContent>
      </Card>
    </section>
  );
}
