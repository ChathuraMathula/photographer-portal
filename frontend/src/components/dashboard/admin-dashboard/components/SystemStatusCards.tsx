"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SystemStatusCards() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-body-small-s font-semibold text-zinc-500">
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-title-medium text-emerald-600">
            Active &amp; Sync
          </p>
          <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
            PostgreSQL DB connected successfully
          </p>
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-body-small-s font-semibold text-zinc-500">
            Local Maildev
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href="http://localhost:1080"
            target="_blank"
            rel="noreferrer"
            className="text-title-medium text-blue-600 dark:text-blue-400 hover:underline block font-semibold"
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
          <CardTitle className="text-body-small-s font-semibold text-zinc-500">
            Local pgAdmin ERD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href="http://localhost:5050"
            target="_blank"
            rel="noreferrer"
            className="text-title-medium text-blue-600 dark:text-blue-400 hover:underline block font-semibold"
          >
            pgAdmin Web UI
          </a>
          <p className="text-body-caption text-zinc-400 mt-1 leading-normal">
            Visual diagram on port 5050
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
