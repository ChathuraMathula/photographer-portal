"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { type UserAccount } from "@/types";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/users/UserTable";
import {
  CreateUserModal,
  type CreateUserValues,
} from "@/components/users/CreateUserModal";
import { UserPlus } from "lucide-react";

const API = "http://localhost:3000";

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

export default function UserManagementPage() {
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
      alert(err.message || "Error updating user status");
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
