"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminCTASectionProps {
  onUsersClick: () => void;
}

export function AdminCTASection({ onUsersClick }: AdminCTASectionProps) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 p-8 text-center bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
      <h2 className="text-title-medium text-primary-dark dark:text-white mb-2">
        Create &amp; Manage User Accounts
      </h2>
      <p className="text-body-small text-zinc-500 mb-6 max-w-lg mx-auto leading-relaxed">
        You have access to create system users. Super Admins can add Admins and
        Photographers. Admins can create Photographers only.
      </p>
      <Button
        onClick={onUsersClick}
        className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-8 shadow-sm"
      >
        Open User Management
      </Button>
    </Card>
  );
}
