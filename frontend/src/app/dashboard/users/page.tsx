"use client";

import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
import { useUserManagement } from "./hooks/useUserManagement";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ADMIN_MENU } from "@/components/dashboard/AdminDashboard";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/users/UserTable";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { UserPlus } from "lucide-react";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";

export default function UserManagementPage() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { start } = useTopLoadingBar();

  const { firstName, role: authRole, id: loggedInUserId } = useSelector(
    (state: RootState) => state.auth
  );

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
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
  } = useUserManagement();

  const handleLogout = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout error:", err);
    }
    dispatch(logout());
    window.location.href = "/login";
  };

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "overview") router.push("/dashboard");
    else if (tab === "reports") router.push("/dashboard/reports");
    else if (tab === "profile") router.push("/dashboard/profile");
    else router.push("/dashboard/users");
  };

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
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
          onClick={() => setShowModal(true)}
          className="btn btn-primary h-11 gap-2 min-w-0 md:min-w-0 px-5 py-0 text-body-small-s shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white dark:bg-zinc-900 p-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-3 bg-zinc-50 border border-zinc-250 rounded-lg text-body-small focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          />
        </div>
        <div className="flex gap-3">
          {loggedInRole === UserRole.SUPER_ADMIN && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-body-small focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admins</option>
              <option value="ADMIN">Admins</option>
              <option value="PHOTOGRAPHER">Photographers</option>
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-body-small focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 animate-pulse">
          Loading users...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          <UserTable users={users} onToggleActive={handleToggleActive} loggedInUserId={loggedInUserId ?? ""} />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-sm">
              <div className="text-body-caption text-zinc-500">
                Showing page <span className="font-semibold text-zinc-800 dark:text-zinc-200">{page}</span> of{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</span> ({total} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 px-4 text-body-caption border border-zinc-200 rounded-lg disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 px-4 text-body-caption border border-zinc-200 rounded-lg disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create user modal */}
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
  );
}
