"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserPlus,
  Shield,
  Camera,
  CheckCircle,
  XCircle,
  Plus,
  Trash,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const API = "http://localhost:3000";

type UserProfile = {
  bookingSlug: string;
  bio?: string;
  baseLocation?: string;
  specializations: string[];
};

type UserAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  profile?: UserProfile;
};

// Validation Schema using Yup
const CreateUserSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: Yup.string().oneOf(Object.values(UserRole)).required("Role is required"),
  phone: Yup.string(),
  // Profile optional fields (only validated/saved if role is PHOTOGRAPHER)
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

  // 1. Fetch Users
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
    if (isAuthenticated && (loggedInRole === UserRole.SUPER_ADMIN || loggedInRole === UserRole.ADMIN)) {
      fetchUsers();
    }
  }, [isAuthenticated, loggedInRole]);

  // 2. Toggle User Active Status
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

  // 3. Formik Form Config
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: loggedInRole === UserRole.ADMIN ? UserRole.PHOTOGRAPHER : UserRole.PHOTOGRAPHER,
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
          specializations: values.role === UserRole.PHOTOGRAPHER ? specsList : undefined,
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
        fetchUsers(); // Refresh list
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

  const handleRemoveSpec = (specToRemove: string) => {
    setSpecsList((prev) => prev.filter((s) => s !== specToRemove));
  };

  if (!isAuthenticated || (loggedInRole !== UserRole.SUPER_ADMIN && loggedInRole !== UserRole.ADMIN)) {
    return <div className="p-8 text-center text-red-500">Access Denied. Authorized roles only.</div>;
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
              Logged in as <span className="font-semibold text-zinc-800 dark:text-zinc-200">{loggedInRole}</span>.
              {loggedInRole === UserRole.SUPER_ADMIN
                ? " Manage all system users, administrators, and photographers."
                : " Manage and register new photographers."}
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="h-11 gap-2 text-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm">
            <UserPlus className="h-4 w-4" /> Create User
          </Button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Loading users...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Registered Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-150 bg-zinc-50/75 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-medium">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Booking Info</th>
                      <th className="p-4 text-right">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/20">
                        <td className="p-4 font-semibold text-zinc-950 dark:text-white">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-350">{user.email}</td>
                        <td className="p-4">
                          {user.role === UserRole.SUPER_ADMIN && (
                            <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                              <Shield className="h-3 w-3" /> Super Admin
                            </span>
                          )}
                          {user.role === UserRole.ADMIN && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          )}
                          {user.role === UserRole.PHOTOGRAPHER && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                              <Camera className="h-3 w-3" /> Photographer
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-zinc-500">{user.phone || "-"}</td>
                        <td className="p-4">
                          {user.profile?.bookingSlug ? (
                            <a
                              href={`/book/${user.profile.bookingSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-zinc-600 hover:underline dark:text-zinc-400"
                            >
                              slug: {user.profile.bookingSlug}
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(user.id)}
                            className={`h-8 gap-1 ${
                              user.isActive
                                ? "text-emerald-700 border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-950/30 dark:bg-emerald-950/10"
                                : "text-zinc-500 hover:bg-zinc-100"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" /> Suspended
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create User Modal Dialog */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
                <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" /> Create New User
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  Cancel
                </Button>
              </div>

              {submitError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  {submitError}
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                
                {/* Basic Account Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...formik.getFieldProps("firstName")}
                      className={formik.touched.firstName && formik.errors.firstName ? "border-red-500" : ""}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-xs text-red-500">{formik.errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...formik.getFieldProps("lastName")}
                      className={formik.touched.lastName && formik.errors.lastName ? "border-red-500" : ""}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-xs text-red-500">{formik.errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...formik.getFieldProps("email")}
                      className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-xs text-red-500">{formik.errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...formik.getFieldProps("password")}
                      className={formik.touched.password && formik.errors.password ? "border-red-500" : ""}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-xs text-red-500">{formik.errors.password}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      disabled={loggedInRole === UserRole.ADMIN} // Admins are locked to creating photographers
                      {...formik.getFieldProps("role")}
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <option value={UserRole.PHOTOGRAPHER}>Photographer</option>
                      {loggedInRole === UserRole.SUPER_ADMIN && (
                        <>
                          <option value={UserRole.ADMIN}>Admin</option>
                          <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" {...formik.getFieldProps("phone")} />
                  </div>
                </div>

                {/* Photographer Profile Fields (Show only if role === PHOTOGRAPHER) */}
                {formik.values.role === UserRole.PHOTOGRAPHER && (
                  <div className="border-t pt-4 mt-4 space-y-4 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Photographer Profile Settings</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="bookingSlug">
                          Booking Link Slug <span className="text-zinc-400 text-xs">(optional)</span>
                        </Label>
                        <Input
                          id="bookingSlug"
                          placeholder="e.g. sarah-johnson"
                          {...formik.getFieldProps("bookingSlug")}
                        />
                        <p className="text-[10px] text-zinc-400">If left blank, slug will generate from name.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="baseLocation">Base Location</Label>
                        <Input
                          id="baseLocation"
                          placeholder="e.g. Colombo, Kandy"
                          {...formik.getFieldProps("baseLocation")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Short Biography</Label>
                      <Input
                        id="bio"
                        placeholder="Wedding & portrait photographer with 5 years experience..."
                        {...formik.getFieldProps("bio")}
                      />
                    </div>

                    {/* Specializations Tag Inputs */}
                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <div className="flex gap-2">
                        <Input
                          value={specsInput}
                          onChange={(e) => setSpecsInput(e.target.value)}
                          placeholder="e.g. Wedding, Portrait, Corporate"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSpec();
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddSpec} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {specsList.map((spec) => (
                          <span
                            key={spec}
                            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {spec}
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(spec)}
                              className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-6 flex justify-end gap-2 dark:border-zinc-800">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Close
                  </Button>
                  <Button type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? "Creating..." : "Save User"}
                  </Button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
