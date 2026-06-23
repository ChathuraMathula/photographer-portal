import { type FormikProps } from "formik";
import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/common/FieldError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export type PackageFormValues = {
  name: string;
  description: string;
  price: number;
  durationHours: number;
  depositType: "universal" | "fixed" | "percentage";
  depositValue: number;
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
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Sticky Header with Background & Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm dark:border-zinc-800">
          <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
            {editingPkg ? "Edit Package Details" : "Create New Package"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={formik.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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

          {/* Deposit Rules configuration */}
          <div className="border-t pt-4 mt-2 dark:border-zinc-800 space-y-4">
            <h3 className="text-body-small-s font-semibold text-zinc-800 dark:text-zinc-200">Advanced Payment Policy</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pkg-depositType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                  Deposit Rule
                </Label>
                <Select
                  value={formik.values.depositType}
                  onValueChange={(val) => formik.setFieldValue("depositType", val)}
                >
                  <SelectTrigger className="h-11 bg-white dark:bg-zinc-950 text-body-small border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
                    <SelectValue placeholder="Select rule" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="universal" className="cursor-pointer">Use Universal Default</SelectItem>
                    <SelectItem value="fixed" className="cursor-pointer">Fixed Price (LKR)</SelectItem>
                    <SelectItem value="percentage" className="cursor-pointer">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formik.values.depositType !== "universal" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="pkg-depositValue" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                    {formik.values.depositType === "fixed" ? "Deposit Value (LKR)" : "Deposit Value (%)"}
                  </Label>
                  <Input
                    id="pkg-depositValue"
                    type="number"
                    min="0"
                    max={formik.values.depositType === "percentage" ? 100 : undefined}
                    {...formik.getFieldProps("depositValue")}
                    className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <FieldError msg={formik.touched.depositValue ? formik.errors.depositValue : undefined} />
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer inside the flex form */}
          <div className="sticky bottom-0 z-10 border-t px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm -mx-6 -mb-6 mt-6 dark:border-zinc-800 flex justify-end gap-3">
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
