import React from "react";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserManagementHeaderProps {
  loggedInRole: UserRole | string | null;
  onCreateUserClick: () => void;
}

export function UserManagementHeader({
  loggedInRole,
  onCreateUserClick,
}: UserManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-title-large text-primary-dark">
          User Management
        </h1>
        <p className="text-body-small text-zinc-500 mt-1">
          Logged in as{" "}
          <span className="font-semibold text-zinc-800">{loggedInRole}</span>.{" "}
          {loggedInRole === UserRole.SUPER_ADMIN
            ? "Manage all system users, administrators, and photographers."
            : "Manage and register new photographers."}
        </p>
      </div>
      <Button
        onClick={onCreateUserClick}
        className="btn btn-primary h-11 gap-2 min-w-0 md:min-w-0 px-5 py-0 text-body-small-s shadow-sm"
      >
        <UserPlus className="h-4 w-4" />
        Create User
      </Button>
    </div>
  );
}
