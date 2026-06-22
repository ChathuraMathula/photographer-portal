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
          <h2 className="text-title-medium text-primary-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Create New User
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="btn btn-secondary h-9 px-3 py-0 min-w-0 md:min-w-0 text-sm"
          >
            Cancel
          </Button>
        </div>

        {submitError && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-250/20">
            {submitError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Basic Account Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cu-firstName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">First Name</Label>
              <Input
                id="cu-firstName"
                {...formik.getFieldProps("firstName")}
                className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-red-500"
                    : ""
                }`}
              />
              <FieldError
                msg={
                  formik.touched.firstName ? formik.errors.firstName : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-lastName" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Last Name</Label>
              <Input
                id="cu-lastName"
                {...formik.getFieldProps("lastName")}
                className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.lastName && formik.errors.lastName
                    ? "border-red-500"
                    : ""
                }`}
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
              <Label htmlFor="cu-email" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Email</Label>
              <Input
                id="cu-email"
                type="email"
                {...formik.getFieldProps("email")}
                className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : ""
                }`}
              />
              <FieldError
                msg={formik.touched.email ? formik.errors.email : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-password" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Password</Label>
              <Input
                id="cu-password"
                type="password"
                {...formik.getFieldProps("password")}
                className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }`}
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
              <Label htmlFor="cu-role" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Role</Label>
              <select
                id="cu-role"
                disabled={loggedInRole === UserRole.ADMIN}
                {...formik.getFieldProps("role")}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 h-11 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
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
              <Label htmlFor="cu-phone" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Phone (optional)</Label>
              <Input
                id="cu-phone"
                {...formik.getFieldProps("phone")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          {/* Photographer Profile Fields */}
          {formik.values.role === UserRole.PHOTOGRAPHER && (
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <h3 className="text-body-small-s font-semibold text-zinc-900 dark:text-white">
                Photographer Profile Settings
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cu-bookingSlug" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                    Booking Link Slug{" "}
                    <span className="text-zinc-400 font-normal text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="cu-bookingSlug"
                    placeholder="e.g. sarah-johnson"
                    {...formik.getFieldProps("bookingSlug")}
                    className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <p className="text-[10px] text-zinc-450 mt-1 pl-1">
                    If left blank, slug will generate from name.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cu-baseLocation" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Base Location</Label>
                  <Input
                    id="cu-baseLocation"
                    placeholder="e.g. Colombo, Kandy"
                    {...formik.getFieldProps("baseLocation")}
                    className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cu-bio" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Short Biography</Label>
                <Input
                  id="cu-bio"
                  placeholder="Wedding & portrait photographer with 5 years experience..."
                  {...formik.getFieldProps("bio")}
                  className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>

              {/* Specializations Tag Inputs */}
              <div className="space-y-2">
                <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Specializations</Label>
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
                    className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <Button
                    type="button"
                    onClick={onAddSpec}
                    className="btn btn-secondary h-11 py-0 min-w-0 md:min-w-0 px-4 shadow-sm"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {specsList.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-body-caption font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => onRemoveSpec(spec)}
                        className="text-zinc-400 hover:text-zinc-650 focus:outline-none cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-6 flex justify-end gap-3 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="btn btn-secondary h-11 py-0 min-w-0 md:min-w-0 px-6 shadow-sm"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-6 shadow-sm"
            >
              {formik.isSubmitting ? "Creating..." : "Save User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
