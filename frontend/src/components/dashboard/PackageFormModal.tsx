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
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {editingPkg ? "Edit Package Details" : "Create New Package"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400">
            Cancel
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">Package Name</Label>
            <Input
              id="pkg-name"
              placeholder="e.g. Bronze Portrait Package"
              {...formik.getFieldProps("name")}
            />
            <FieldError msg={formik.touched.name ? formik.errors.name : undefined} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-description">Description</Label>
            <textarea
              id="pkg-description"
              rows={2}
              placeholder="Describe details, deliverables..."
              {...formik.getFieldProps("description")}
              className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-price">Price (LKR)</Label>
              <Input
                id="pkg-price"
                type="number"
                {...formik.getFieldProps("price")}
              />
              <FieldError msg={formik.touched.price ? formik.errors.price : undefined} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-duration">Duration (Hours)</Label>
              <Input
                id="pkg-duration"
                type="number"
                {...formik.getFieldProps("durationHours")}
              />
              <FieldError
                msg={formik.touched.durationHours ? formik.errors.durationHours : undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-includes">
              Included Items{" "}
              <span className="text-zinc-400 font-normal">(comma separated)</span>
            </Label>
            <Input
              id="pkg-includes"
              placeholder="e.g. 1 Hour coverage, 15 edited photos, raw images"
              value={includesText}
              onChange={(e) => onIncludesChange(e.target.value)}
            />
            <p className="text-[10px] text-zinc-400">Separate items by comma.</p>
          </div>

          <div className="border-t pt-4 mt-6 flex justify-end gap-2 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPkg ? "Save Changes" : "Create Package"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
