import React, { useState } from "react";
import { type FormikProps } from "formik";
import { UserRole } from "@/store/slices/authSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/feedback/FieldError";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateUserValues } from "../CreateUserModal";

type Props = { formik: FormikProps<CreateUserValues>; loggedInRole: UserRole };

export function CreateUserBasicFields({ formik, loggedInRole }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="cu-firstName"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            First Name
          </Label>
          <Input
            id="cu-firstName"
            {...formik.getFieldProps("firstName")}
            className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.firstName && formik.errors.firstName ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.firstName ? formik.errors.firstName : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="cu-lastName"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Last Name
          </Label>
          <Input
            id="cu-lastName"
            {...formik.getFieldProps("lastName")}
            className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.lastName && formik.errors.lastName ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.lastName ? formik.errors.lastName : undefined}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="cu-email"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Email
          </Label>
          <Input
            id="cu-email"
            type="email"
            {...formik.getFieldProps("email")}
            className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.email && formik.errors.email ? "border-red-500" : ""}`}
          />
          <FieldError
            msg={formik.touched.email ? formik.errors.email : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="cu-password"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="cu-password"
              type={showPassword ? "text" : "password"}
              {...formik.getFieldProps("password")}
              className={`h-[50px] pr-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${formik.touched.password && formik.errors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldError
            msg={formik.touched.password ? formik.errors.password : undefined}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="cu-role"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Role
          </Label>
          <Select
            disabled={loggedInRole === UserRole.ADMIN}
            value={formik.values.role}
            onValueChange={(val) => formik.setFieldValue("role", val)}
          >
            <SelectTrigger className="h-[50px] bg-white dark:bg-zinc-950 text-body-small border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-in duration-100">
              <SelectItem value={UserRole.ADMIN} className="cursor-pointer">
                Admin
              </SelectItem>
              {loggedInRole === UserRole.SUPER_ADMIN && (
                <SelectItem
                  value={UserRole.SUPER_ADMIN}
                  className="cursor-pointer"
                >
                  Super Admin
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="cu-phone"
            className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Phone (optional)
          </Label>
          <Input
            id="cu-phone"
            {...formik.getFieldProps("phone")}
            className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      </div>
    </>
  );
}
