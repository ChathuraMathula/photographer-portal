import React from "react";
import { type FormikProps } from "formik";
import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import { ModalLayout } from "@/components/modals/ModalLayout";
import { PackageFormBasicInfo } from "@/components/modals/package-form/components/PackageFormBasicInfo";
import { PackageFormPricing } from "@/components/modals/package-form/components/PackageFormPricing";

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
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        className="btn btn-secondary btn-modal h-11 py-0 px-6 shadow-sm flex-1 animate-in fade-in duration-100"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        className="btn btn-primary btn-modal h-11 py-0 px-6 shadow-sm flex-1 animate-in fade-in duration-100"
      >
        {editingPkg ? "Save Changes" : "Create Package"}
      </Button>
    </div>
  );

  return (
    <ModalLayout
      title={editingPkg ? "Edit Package Details" : "Create New Package"}
      onClose={handleClose}
      onSubmit={formik.handleSubmit}
      footer={footer}
      maxWidth="max-w-lg"
    >
      <PackageFormBasicInfo
        formik={formik}
        includesText={includesText}
        onIncludesChange={onIncludesChange}
      />
      <PackageFormPricing formik={formik} />
    </ModalLayout>
  );
}
