"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
export type CustomPackageValues = {
  name: string;
  description: string;
  price: number;
  durationHours: number;
  depositType: "universal" | "fixed" | "percentage";
  depositValue: number;
  includes: string[];
};
import { useCustomPackageForm } from "./custom-package/hooks/useCustomPackageForm";
import { CustomPackageFormFields } from "./custom-package/components/CustomPackageFormFields";
import { CustomPackageDepositRules } from "./custom-package/components/CustomPackageDepositRules";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CustomPackageValues) => void;
  initialValues?: CustomPackageValues;
};

export function CustomPackageModal({ isOpen, onClose, onSubmit, initialValues }: Props) {
  const form = useCustomPackageForm({ initialValues, onSubmit, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <form
        onSubmit={form.handleFormSubmit}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
            Create Custom Package
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
          <CustomPackageFormFields
            name={form.name}
            setName={form.setName}
            description={form.description}
            setDescription={form.setDescription}
            price={form.price}
            setPrice={form.setPrice}
            durationHours={form.durationHours}
            setDurationHours={form.setDurationHours}
            includesText={form.includesText}
            setIncludesText={form.setIncludesText}
            errors={form.errors}
          />
          <CustomPackageDepositRules
            depositType={form.depositType}
            setDepositType={form.setDepositType}
            depositValue={form.depositValue}
            setDepositValue={form.setDepositValue}
            errors={form.errors}
          />
        </div>

        <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="btn btn-secondary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn btn-primary btn-modal h-11 py-0 px-6 shadow-sm animate-in fade-in duration-100"
          >
            Save Custom Package
          </Button>
        </div>
      </form>
    </div>
  );
}
