"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const AdminProfileSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  phone: Yup.string(),
  password: Yup.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match"),
});

export function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: AdminProfileSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const body: any = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        };
        if (values.password) {
          body.password = values.password;
        }

        const res = await fetch(`${API}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to update profile");
        }

        toast.success("Profile settings updated successfully!");
        formik.setFieldValue("password", "");
        formik.setFieldValue("confirmPassword", "");
      } catch (err: any) {
        toast.error(err.message || "An error occurred while updating profile");
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/users/me`, { credentials: "include" });
        if (!res.ok) throw new Error("Could not load user profile");
        const data = await res.json();
        formik.setValues({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          phone: data.phone || "",
          password: "",
          confirmPassword: "",
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20">
          <CardTitle className="text-title-medium text-primary-dark dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-zinc-400" /> Personal Account Profile
          </CardTitle>
          <CardDescription>
            Update your administrator details, email configurations, and password settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Readonly Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <div>
                <Label className="text-body-caption font-semibold text-zinc-400">Account Email</Label>
                <p className="text-body-small-s font-semibold text-zinc-900 dark:text-white mt-0.5 select-all">
                  {formik.values.email}
                </p>
              </div>
              <div>
                <Label className="text-body-caption font-semibold text-zinc-400 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Assigned System Role
                </Label>
                <p className="text-body-small-s font-semibold text-primary-light mt-0.5">
                  {formik.values.role}
                </p>
              </div>
            </div>

            {/* Editable Profile Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...formik.getFieldProps("firstName")}
                  className={`h-11 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${
                    formik.touched.firstName && formik.errors.firstName ? "border-red-500" : ""
                  }`}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-xs text-red-500">{formik.errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...formik.getFieldProps("lastName")}
                  className={`h-11 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${
                    formik.touched.lastName && formik.errors.lastName ? "border-red-500" : ""
                  }`}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-xs text-red-500">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-zinc-400" /> Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                {...formik.getFieldProps("phone")}
                className="h-11 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark"
                placeholder="+94 77 123 4567"
              />
            </div>

            {/* Change Password Section */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
              <h3 className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-zinc-400" /> Update Security Password
              </h3>
              <p className="text-body-caption text-zinc-500 leading-normal">
                Leave these fields blank if you do not wish to change your current login password.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...formik.getFieldProps("password")}
                      className={`h-11 pr-10 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${
                        formik.touched.password && formik.errors.password ? "border-red-500" : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-xs text-red-500">{formik.errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...formik.getFieldProps("confirmPassword")}
                      className={`h-11 pr-10 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${
                        formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="submit"
                disabled={saving}
                className="btn btn-primary h-11 px-8 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving Changes..." : "Save Profile Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
