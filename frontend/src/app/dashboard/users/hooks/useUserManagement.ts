"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";

import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { type UserAccount } from "@/types";
import { type CreateUserValues } from "@/components/users/CreateUserModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const CreateUserSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(Object.values(UserRole))
    .required("Role is required"),
  phone: Yup.string(),
  bookingSlug: Yup.string(),
  bio: Yup.string(),
  baseLocation: Yup.string(),
});

export function useUserManagement() {
  const { role: loggedInRole, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [specsInput, setSpecsInput] = useState("");
  const [specsList, setSpecsList] = useState<string[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load users");
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      (loggedInRole === UserRole.SUPER_ADMIN || loggedInRole === UserRole.ADMIN)
    ) {
      fetchUsers();
    }
  }, [isAuthenticated, loggedInRole]);

  const handleToggleActive = async (userId: string) => {
    try {
      const res = await fetch(`${API}/users/${userId}/toggle-active`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: data.isActive } : u))
      );
    } catch (err: any) {
      toast.error(err.message || "Error updating user status");
    }
  };

  const formik = useFormik<CreateUserValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: UserRole.PHOTOGRAPHER,
      phone: "",
      bookingSlug: "",
      bio: "",
      baseLocation: "",
    },
    validationSchema: CreateUserSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitError("");
      try {
        const body = {
          ...values,
          specializations:
            values.role === UserRole.PHOTOGRAPHER ? specsList : undefined,
        };
        const res = await fetch(`${API}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create user");
        setShowModal(false);
        resetForm();
        setSpecsList([]);
        setSpecsInput("");
        fetchUsers();
      } catch (err: any) {
        setSubmitError(err.message || "Failed to create user");
      }
    },
  });

  const handleAddSpec = () => {
    if (specsInput.trim() && !specsList.includes(specsInput.trim())) {
      setSpecsList((prev) => [...prev, specsInput.trim()]);
      setSpecsInput("");
    }
  };

  const handleRemoveSpec = (spec: string) => {
    setSpecsList((prev) => prev.filter((s) => s !== spec));
  };

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
  };
}
