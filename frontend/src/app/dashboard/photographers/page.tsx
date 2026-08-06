"use client";

import React, { useState, useEffect } from "react";
import { usePhotographerDashboardContext } from "@/app/dashboard/context/PhotographerDashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Phone,
  Camera,
  User,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  role?: string;
  isActive: boolean;
  bookingSlug?: string;
  bio?: string;
  specializations?: string[];
}

interface CapacityInfo {
  used: number;
  max: number;
  plan: string;
}

const AddMemberSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  phone: Yup.string().optional(),
  role: Yup.string().oneOf(["STUDIO_PHOTOGRAPHER", "STUDIO_STAFF"]).required(),
});

export default function StudioTeamPage() {
  const context = usePhotographerDashboardContext();

  const [capacity, setCapacity] = useState<CapacityInfo>({ used: 0, max: 5, plan: "FREE" });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchTeam = async () => {
    if (!context?.authFetch) return;
    try {
      setLoading(true);
      const res = await context.authFetch(`${API}/studios/my/photographers`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.photographers || []);
        if (data.capacity) setCapacity(data.capacity);
      }
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [context?.authFetch]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "STUDIO_PHOTOGRAPHER",
    },
    validationSchema: AddMemberSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setServerError("");
      if (!context?.authFetch) return;
      const { confirmPassword, ...payload } = values;
      try {
        const res = await context.authFetch(`${API}/studios/my/photographers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to create team member");
        }
        toast.success("Team member created successfully!");
        resetForm();
        setShowAddModal(false);
        fetchTeam();
      } catch (err: any) {
        setServerError(err.message || "Failed to add team member.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-[#0e2d5c] dark:text-blue-400" />
            Studio Team & Staff Management
          </h1>
          <p className="text-body-small text-zinc-500 mt-1">
            Manage your registered studio photographers, staff, and account credentials.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          disabled={capacity.used >= capacity.max}
          className="bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold text-xs h-11 px-5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Quota Overview Card */}
      <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Subscription Plan Capacity
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200">
                {capacity.plan} PLAN
              </span>
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">
              {capacity.used} of {capacity.max} Slots Used
            </h3>
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (capacity.used / capacity.max) * 100)}%`,
                }}
              />
            </div>
            {capacity.used >= capacity.max && (
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Quota limit reached. Upgrade subscription plan to add more members.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Team Members Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Active Team Members ({teamMembers.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <Card className="border-dashed border-zinc-250 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl">
            <div className="max-w-sm mx-auto space-y-3">
              <Users className="h-10 w-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No Team Members Added
              </h3>
              <p className="text-xs text-zinc-500">
                Add your studio photographers and staff members to assign incoming bookings.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#0e2d5c] to-blue-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                          {member.firstName} {member.lastName}
                        </h3>
                        {member.username && (
                          <p className="text-xs text-zinc-400 font-medium">{member.username}</p>
                        )}
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                      {member.role === "STUDIO_STAFF" ? "Staff" : "Photographer"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Active Account
                  </span>
                  {member.bookingSlug && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      /{member.bookingSlug}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#0e2d5c] dark:text-blue-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Add New Studio Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {serverError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs text-red-600 font-medium border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">First Name</Label>
                  <Input
                    placeholder="First Name"
                    {...formik.getFieldProps("firstName")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-[10px] font-semibold text-red-500">{formik.errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Last Name</Label>
                  <Input
                    placeholder="Last Name"
                    {...formik.getFieldProps("lastName")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-[10px] font-semibold text-red-500">{formik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="photographer@studio.com"
                    {...formik.getFieldProps("email")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-[10px] font-semibold text-red-500">{formik.errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Username</Label>
                  <Input
                    placeholder="john_studio"
                    {...formik.getFieldProps("username")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="text-[10px] font-semibold text-red-500">{formik.errors.username}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...formik.getFieldProps("password")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-[10px] font-semibold text-red-500">{formik.errors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...formik.getFieldProps("confirmPassword")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="text-[10px] font-semibold text-red-500">{formik.errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Role</Label>
                  <select
                    {...formik.getFieldProps("role")}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STUDIO_PHOTOGRAPHER">Studio Photographer</option>
                    <option value="STUDIO_STAFF">Studio Staff</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Phone (Optional)</Label>
                  <Input
                    placeholder="+94 77 123 4567"
                    {...formik.getFieldProps("phone")}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 h-11 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-1/2 h-11 rounded-xl bg-[#0e2d5c] hover:bg-[#0b244a] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {formik.isSubmitting ? "Creating..." : "Create Team Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
