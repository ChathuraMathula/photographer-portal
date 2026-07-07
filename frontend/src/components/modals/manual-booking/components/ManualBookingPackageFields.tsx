import React from "react";
import { type FormikProps } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/feedback/FieldError";
import { type Package } from "@/types";
import { type ManualBookingValues } from "@/components/modals/ManualBookingModal";

type Props = { formik: FormikProps<ManualBookingValues>; packages?: Package[]; universalDepositType?: string; universalDepositValue?: number; };

export function ManualBookingPackageFields({ formik, packages = [], universalDepositType = "fixed", universalDepositValue = 5000 }: Props) {
  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    formik.setFieldValue("packageId", val);
    if (val) {
      const selected = packages.find((p) => p.id === val);
      if (selected) {
        const priceLkr = selected.priceInCents / 100;
        formik.setFieldValue("totalAmountLkr", priceLkr);
        let depositLkr = 0;
        const depType = selected.depositType || "universal";
        if (depType === "fixed") depositLkr = (selected.depositValue ?? 0) / 100;
        else if (depType === "percentage") depositLkr = (priceLkr * (selected.depositValue ?? 0)) / 100;
        else depositLkr = universalDepositType === "fixed" ? universalDepositValue : (priceLkr * universalDepositValue) / 100;
        formik.setFieldValue("advancePaymentLkr", Math.round(depositLkr));
      }
    } else {
      formik.setFieldValue("totalAmountLkr", ""); formik.setFieldValue("advancePaymentLkr", "");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="mb-packageId" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Package (optional)</Label>
        <select id="mb-packageId" value={formik.values.packageId} onChange={handlePackageChange} className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-body-small text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-dark transition-all">
          <option value="">-- No Package --</option>
          {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name} (LKR {(pkg.priceInCents / 100).toLocaleString()})</option>)}
        </select>
        <FieldError msg={formik.touched.packageId ? formik.errors.packageId : undefined} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mb-totalAmountLkr" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Total Price (LKR)</Label>
          <Input id="mb-totalAmountLkr" type="number" {...formik.getFieldProps("totalAmountLkr")} className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark ${formik.touched.totalAmountLkr && formik.errors.totalAmountLkr ? "border-red-500" : ""}`} />
          <FieldError msg={formik.touched.totalAmountLkr ? formik.errors.totalAmountLkr : undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mb-advancePaymentLkr" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Advance Paid (LKR)</Label>
          <Input id="mb-advancePaymentLkr" type="number" {...formik.getFieldProps("advancePaymentLkr")} className={`h-11 rounded-xl border-zinc-200 focus:ring-primary-dark ${formik.touched.advancePaymentLkr && formik.errors.advancePaymentLkr ? "border-red-500" : ""}`} />
          <FieldError msg={formik.touched.advancePaymentLkr ? formik.errors.advancePaymentLkr : undefined} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mb-notes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Notes / Special requests</Label>
        <textarea id="mb-notes" rows={2} {...formik.getFieldProps("notes")} className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark" />
      </div>
    </>
  );
}
