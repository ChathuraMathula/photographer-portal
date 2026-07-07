import { type FormikProps } from "formik";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { CreateUserBasicFields } from "./components/CreateUserBasicFields";
import { CreateUserPhotographerFields } from "./components/CreateUserPhotographerFields";

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
  city: string;
  district: string;
  locationMapLink: string;
  coordinates?: string;
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
      <form
        onSubmit={formik.handleSubmit}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <h2 className="text-title-medium text-primary-dark dark:text-white flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Create New User
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {submitError && (
            <div className="rounded-xl bg-red-50 p-4 text-body-small-s text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-250/20 animate-in fade-in duration-100">
              {submitError}
            </div>
          )}
          <CreateUserBasicFields formik={formik} loggedInRole={loggedInRole} />
          {formik.values.role === UserRole.PHOTOGRAPHER && (
            <CreateUserPhotographerFields
              formik={formik}
              specsInput={specsInput}
              specsList={specsList}
              onSpecsInputChange={onSpecsInputChange}
              onAddSpec={onAddSpec}
              onRemoveSpec={onRemoveSpec}
            />
          )}
        </div>
        <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="btn btn-secondary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
          >
            Close
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="btn btn-primary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
          >
            {formik.isSubmitting ? "Creating..." : "Save User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
