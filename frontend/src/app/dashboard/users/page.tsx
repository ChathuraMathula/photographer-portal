"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { useUserManagement } from "./hooks/useUserManagement";
import { UserTable } from "@/components/users/UserTable";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { UserManagementHeader } from "./components/UserManagementHeader";
import { UserFiltersBar } from "./components/UserFiltersBar";
import { UserPaginationFooter } from "./components/UserPaginationFooter";

export default function UserManagementPage() {
  const { id: loggedInUserId } = useSelector((state: RootState) => state.auth);

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
    handleDeleteUser,
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
    unreadUserIds,
    markAsRead,
  } = useUserManagement();

  if (
    !isAuthenticated ||
    (loggedInRole !== UserRole.SUPER_ADMIN && loggedInRole !== UserRole.ADMIN)
  ) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Access Denied. Authorized roles only.
      </div>
    );
  }

  const unreadCount = users.filter((u) => unreadUserIds.includes(u.id)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <UserManagementHeader
        loggedInRole={loggedInRole}
        onCreateUserClick={() => setShowModal(true)}
      />

      {/* Filters Bar */}
      <UserFiltersBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loggedInRole={loggedInRole}
        unreadCount={unreadCount}
      />

      {/* Users list */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 animate-pulse">
          Loading users...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          <UserTable
            users={users}
            onToggleActive={handleToggleActive}
            onDeleteUser={handleDeleteUser}
            loggedInUserId={loggedInUserId ?? ""}
            loggedInRole={loggedInRole as UserRole}
            unreadUserIds={unreadUserIds}
            onMarkAsRead={markAsRead}
          />

          {/* Pagination */}
          <UserPaginationFooter
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
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
