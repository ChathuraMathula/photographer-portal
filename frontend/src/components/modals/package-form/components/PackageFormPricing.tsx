import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PackageFormValues } from "@/components/modals/PackageFormModal";

type Props = {
  formik: FormikProps<PackageFormValues>;
};

export function PackageFormPricing({ formik }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pkg-price" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Price (LKR)</Label>
          <Input
            id="pkg-price"
            type="number"
            {...formik.getFieldProps("price")}
            className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
          />
          <FieldError msg={formik.touched.price ? formik.errors.price : undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pkg-duration" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Duration (Hours)</Label>
          <Input
            id="pkg-duration"
            type="number"
            {...formik.getFieldProps("durationHours")}
            className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
          />
          <FieldError msg={formik.touched.durationHours ? formik.errors.durationHours : undefined} />
        </div>
      </div>

      <div className="border-t pt-4 mt-2 dark:border-zinc-800 space-y-4">
        <h3 className="text-body-small-s font-semibold text-zinc-800 dark:text-zinc-200">Advanced Payment Policy</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pkg-depositType" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Deposit Rule
            </Label>
            <Select
              value={formik.values.depositType}
              onValueChange={(val: any) => formik.setFieldValue("depositType", val)}
            >
              <SelectTrigger className="h-[50px] bg-white dark:bg-zinc-950 text-body-small border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer">
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
                className="h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
              <FieldError msg={formik.touched.depositValue ? formik.errors.depositValue : undefined} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
