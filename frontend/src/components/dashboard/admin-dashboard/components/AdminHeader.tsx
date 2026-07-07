"use client";

import React from "react";

interface AdminHeaderProps {
  firstName: string;
  role: string;
}

export function AdminHeader({ firstName, role }: AdminHeaderProps) {
  return (
    <div>
      <h1 className="text-title-large text-primary-dark dark:text-white">
        Admin Portal
      </h1>
      <p className="text-body-small text-zinc-500 mt-1">
        Welcome back,{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {firstName}
        </span>
        {" · "}
        <span className="font-semibold text-zinc-600 dark:text-zinc-400">
          {role}
        </span>
      </p>
    </div>
  );
}
