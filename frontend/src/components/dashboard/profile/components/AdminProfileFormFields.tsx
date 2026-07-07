import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormikProps } from "formik";

type Props = { formik: FormikProps<any>; saving: boolean; };

export function AdminProfileFormFields({ formik, saving }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
        <div>
          <Label className="text-body-caption font-semibold text-zinc-400">Account Email</Label>
          <p className="text-body-small-s font-semibold text-zinc-900 dark:text-white mt-0.5 select-all">{formik.values.email}</p>
        </div>
        <div>
          <Label className="text-body-caption font-semibold text-zinc-400 flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Assigned System Role</Label>
          <p className="text-body-small-s font-semibold text-primary-light mt-0.5">{formik.values.role}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">First Name</Label>
          <Input id="firstName" {...formik.getFieldProps("firstName")} className={`h-11 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${formik.touched.firstName && formik.errors.firstName ? "border-red-500" : ""}`} />
          {formik.touched.firstName && formik.errors.firstName && <p className="text-xs text-red-500">{formik.errors.firstName as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Last Name</Label>
          <Input id="lastName" {...formik.getFieldProps("lastName")} className={`h-11 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${formik.touched.lastName && formik.errors.lastName ? "border-red-500" : ""}`} />
          {formik.touched.lastName && formik.errors.lastName && <p className="text-xs text-red-500">{formik.errors.lastName as string}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-zinc-400" /> Phone Number (Optional)</Label>
        <Input id="phone" {...formik.getFieldProps("phone")} className="h-11 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark" placeholder="+94 77 123 4567" />
      </div>
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
        <h3 className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"><Lock className="h-4 w-4 text-zinc-400" /> Update Security Password</h3>
        <p className="text-body-caption text-zinc-500 leading-normal">Leave these fields blank if you do not wish to change your current login password.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">New Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} {...formik.getFieldProps("password")} className={`h-11 pr-10 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${formik.touched.password && formik.errors.password ? "border-red-500" : ""}`} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {formik.touched.password && formik.errors.password && <p className="text-xs text-red-500">{formik.errors.password as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Confirm New Password</Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...formik.getFieldProps("confirmPassword")} className={`h-11 pr-10 rounded-xl dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-primary-dark ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""}`} placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 transition-colors">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-xs text-red-500">{formik.errors.confirmPassword as string}</p>}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button type="submit" disabled={saving} className="btn btn-primary h-11 px-8 rounded-xl font-bold flex items-center gap-2 cursor-pointer">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {saving ? "Saving Changes..." : "Save Profile Settings"}
        </Button>
      </div>
    </form>
  );
}
