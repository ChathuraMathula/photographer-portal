"use client";

import { useUserManagementAuth } from "./useUserManagementAuth";
import { useUserList } from "./useUserList";
import { useCreateUserForm } from "./useCreateUserForm";

export function useUserManagement() {
  const { loggedInRole, isAuthenticated, authFetch } = useUserManagementAuth();

  const {
    users,
    loading,
    error,
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
    fetchUsers,
    handleToggleActive,
    handleDeleteUser,
  } = useUserList({
    isAuthenticated,
    loggedInRole,
    authFetch,
  });

  const {
    showModal,
    setShowModal,
    submitError,
    specsInput,
    setSpecsInput,
    specsList,
    formik,
    handleAddSpec,
    handleRemoveSpec,
  } = useCreateUserForm({
    authFetch,
    onSuccess: fetchUsers,
  });

  return {
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
  };
}
