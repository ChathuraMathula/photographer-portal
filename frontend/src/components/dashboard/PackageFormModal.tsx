import { type FormikProps } from "formik";
import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";

export type PackageFormValues = {
  name: string;
  description: string;
  price: number;
  durationHours: number;
};

type Props = {
  formik: FormikProps<PackageFormValues>;
  editingPkg: Package | null;
  includesText: string;
  onIncludesChange: (v: string) => void;
  onClose: () => void;
};

export function PackageFormModal({
  formik,
  editingPkg,
  includesText,
  onIncludesChange,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
          <h2 className="text-title-medium text-primary-dark dark:text-white">
            {editingPkg ? "Edit Package Details" : "Create New Package"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="btn btn-secondary h-9 px-3 py-0 min-w-0 md:min-w-0 text-body-small-s">
            Cancel
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-name" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Package Name</Label>
            <Input
              id="pkg-name"
              placeholder="e.g. Bronze Portrait Package"
              {...formik.getFieldProps("name")}
              className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
            <FieldError msg={formik.touched.name ? formik.errors.name : undefined} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-description" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Description</Label>
            <textarea
              id="pkg-description"
              rows={2}
              placeholder="Describe details, deliverables..."
              {...formik.getFieldProps("description")}
              className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-price" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Price (LKR)</Label>
              <Input
                id="pkg-price"
                type="number"
                {...formik.getFieldProps("price")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.price ? formik.errors.price : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-duration" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Duration (Hours)</Label>
              <Input
                id="pkg-duration"
                type="number"
                {...formik.getFieldProps("durationHours")}
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError
                msg={formik.touched.durationHours ? formik.errors.durationHours : undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-includes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Included Items{" "}
              <span className="text-zinc-400 font-normal">(comma separated)</span>
            </Label>
            <Input
              id="pkg-includes"
              placeholder="e.g. 1 Hour coverage, 15 edited photos, raw images"
              value={includesText}
              onChange={(e) => onIncludesChange(e.target.value)}
              className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
            <p className="text-body-caption text-zinc-455 mt-1 pl-1">Separate items by comma.</p>
          </div>

          <div className="border-t pt-4 mt-6 flex justify-end gap-3 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="btn btn-secondary h-11 py-0 min-w-0 md:min-w-0 px-6 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-6 shadow-sm"
            >
              {editingPkg ? "Save Changes" : "Create Package"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
