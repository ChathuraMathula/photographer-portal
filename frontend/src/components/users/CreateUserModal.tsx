import { type FormikProps } from "formik";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import { Sparkles } from "lucide-react";

export type CreateUserValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  bookingSlug: string;
  bio: string;
  baseLocation: string;
};

type Props = {
  formik: FormikProps<CreateUserValues>;
  loggedInRole: UserRole;
  submitError: string;
  specsInput: string;
  specsList: string[];
  onSpecsInputChange: (v: string) => void;
  onAddSpec: () => void;
  onRemoveSpec: (spec: string) => void;
  onClose: () => void;
};

export function CreateUserModal({
  formik,
  loggedInRole,
  submitError,
  specsInput,
  specsList,
  onSpecsInputChange,
  onAddSpec,
  onRemoveSpec,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Create New User
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
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
              <Label htmlFor="cu-firstName">First Name</Label>
              <Input
                id="cu-firstName"
                {...formik.getFieldProps("firstName")}
                className={
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.firstName ? formik.errors.firstName : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-lastName">Last Name</Label>
              <Input
                id="cu-lastName"
                {...formik.getFieldProps("lastName")}
                className={
                  formik.touched.lastName && formik.errors.lastName
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.lastName ? formik.errors.lastName : undefined
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cu-email">Email</Label>
              <Input
                id="cu-email"
                type="email"
                {...formik.getFieldProps("email")}
                className={
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={formik.touched.email ? formik.errors.email : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-password">Password</Label>
              <Input
                id="cu-password"
                type="password"
                {...formik.getFieldProps("password")}
                className={
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }
              />
              <FieldError
                msg={
                  formik.touched.password ? formik.errors.password : undefined
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cu-role">Role</Label>
              <select
                id="cu-role"
                disabled={loggedInRole === UserRole.ADMIN}
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
              <Label htmlFor="cu-phone">Phone (optional)</Label>
              <Input id="cu-phone" {...formik.getFieldProps("phone")} />
            </div>
          </div>

          {/* Photographer Profile Fields */}
          {formik.values.role === UserRole.PHOTOGRAPHER && (
            <div className="border-t pt-4 mt-4 space-y-4 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Photographer Profile Settings
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cu-bookingSlug">
                    Booking Link Slug{" "}
                    <span className="text-zinc-400 text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="cu-bookingSlug"
                    placeholder="e.g. sarah-johnson"
                    {...formik.getFieldProps("bookingSlug")}
                  />
                  <p className="text-[10px] text-zinc-400">
                    If left blank, slug will generate from name.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cu-baseLocation">Base Location</Label>
                  <Input
                    id="cu-baseLocation"
                    placeholder="e.g. Colombo, Kandy"
                    {...formik.getFieldProps("baseLocation")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cu-bio">Short Biography</Label>
                <Input
                  id="cu-bio"
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
                    onChange={(e) => onSpecsInputChange(e.target.value)}
                    placeholder="e.g. Wedding, Portrait, Corporate"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onAddSpec();
                      }
                    }}
                  />
                  <Button type="button" onClick={onAddSpec} variant="outline">
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
                        onClick={() => onRemoveSpec(spec)}
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
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Creating..." : "Save User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
