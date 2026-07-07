"use client";

import React from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerHeaderProps {
  date: string | Date;
}

export function CustomerHeader({ date }: CustomerHeaderProps) {
  return (
    <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
      <CardTitle className="text-title-medium text-primary-dark dark:text-white">
        Customer Request Details
      </CardTitle>
      <CardDescription className="text-body-small text-zinc-500 mt-1">
        Submitted on {new Date(date).toDateString()}
      </CardDescription>
    </CardHeader>
  );
}
