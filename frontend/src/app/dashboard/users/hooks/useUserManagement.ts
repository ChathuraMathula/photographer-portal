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
    fetchUsers,
    handleToggleActive,
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
  };
}
