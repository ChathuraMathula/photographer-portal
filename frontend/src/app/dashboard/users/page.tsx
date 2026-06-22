"use client";

import { useUserManagement } from "./hooks/useUserManagement";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/users/UserTable";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { UserPlus } from "lucide-react";

export default function UserManagementPage() {
  const {
    loggedInRole,
    isAuthenticated,
    users,
    loading,
    error,
    showModal,
    setShowModal,
    submitError,
    specsInput,
    setSpecsInput,
    specsList,
    handleToggleActive,
    formik,
    handleAddSpec,
    handleRemoveSpec,
  } = useUserManagement();

  if (
    !isAuthenticated ||
    (loggedInRole !== UserRole.SUPER_ADMIN && loggedInRole !== UserRole.ADMIN)
  ) {
    return (
      <div className="p-8 text-center text-red-500">
        Access Denied. Authorized roles only.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              User Management
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Logged in as{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {loggedInRole}
              </span>
              .{" "}
              {loggedInRole === UserRole.SUPER_ADMIN
                ? "Manage all system users, administrators, and photographers."
                : "Manage and register new photographers."}
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="h-11 gap-2 text-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Create User
          </Button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">
            Loading users...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <UserTable users={users} onToggleActive={handleToggleActive} />
        )}

        {/* Modal */}
        {showModal && (
          <CreateUserModal
            formik={formik}
            loggedInRole={loggedInRole as UserRole}
            submitError={submitError}
            specsInput={specsInput}
            specsList={specsList}
            onSpecsInputChange={setSpecsInput}
            onAddSpec={handleAddSpec}
            onRemoveSpec={handleRemoveSpec}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </main>
  );
}
