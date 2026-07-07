"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import { type Package } from "@/types";
import { type PackageFormValues } from "@/components/modals/PackageFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const PackageSchema = Yup.object().shape({
  name: Yup.string().required("Package name is required"),
  description: Yup.string(),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  durationHours: Yup.number()
    .integer("Hours must be integer")
    .positive("Hours must be positive")
    .required("Duration is required"),
  depositType: Yup.string(),
  depositValue: Yup.number()
    .min(0, "Cannot be negative")
    .test("max-deposit", "Invalid deposit value", function (value) {
      const { depositType, price } = this.parent;
      if (depositType === "fixed") {
        if (value === undefined || value === null) return this.createError({ message: "Deposit value is required" });
        if (value > price) return this.createError({ message: "Deposit cannot exceed package price" });
      } else if (depositType === "percentage") {
        if (value === undefined || value === null) return this.createError({ message: "Deposit value is required" });
        if (value > 100) return this.createError({ message: "Percentage cannot exceed 100%" });
      }
      return true;
    }),
});

interface UseDashboardPackagesProps {
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  loadPhotographerData: () => Promise<void>;
}

export function useDashboardPackages({ authFetch, loadPhotographerData }: UseDashboardPackagesProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [packageIncludesText, setPackageIncludesText] = useState("");

  const packageFormik = useFormik<PackageFormValues>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      durationHours: 1,
      depositType: "universal",
      depositValue: 0,
    },
    validationSchema: PackageSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const body = {
          name: values.name,
          description: values.description,
          priceInCents: values.price * 100,
          durationHours: values.durationHours,
          includes: packageIncludesText
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i.length > 0),
          depositType: values.depositType,
          depositValue:
            values.depositType === "fixed"
              ? Math.round(values.depositValue * 100)
              : Math.round(values.depositValue),
        };
        const url = editingPkg ? `${API}/packages/${editingPkg.id}` : `${API}/packages`;
        const method = editingPkg ? "PATCH" : "POST";
        const res = await authFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to save package");
        setShowPackageModal(false);
        resetForm();
        setEditingPkg(null);
        setPackageIncludesText("");
        await loadPhotographerData();
        toast.success(editingPkg ? "Package updated successfully!" : "Package created successfully!");
      } catch (err) {
        toast.error("Error saving package details");
      }
    },
  });

  const handleEditPackage = (pkg: Package) => {
    setEditingPkg(pkg);
    packageFormik.setValues({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.priceInCents / 100,
      durationHours: pkg.durationHours,
      depositType: (pkg.depositType as any) || "universal",
      depositValue:
        pkg.depositType === "fixed"
          ? (pkg.depositValue ?? 0) / 100
          : pkg.depositValue ?? 0,
    });
    setPackageIncludesText(pkg.includes.join(", "));
    setShowPackageModal(true);
  };

  const handleDeletePackage = async (pkgId: string) => {
    try {
      const res = await authFetch(`${API}/packages/${pkgId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await loadPhotographerData();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    packages,
    setPackages,
    showPackageModal,
    setShowPackageModal,
    editingPkg,
    setEditingPkg,
    packageIncludesText,
    setPackageIncludesText,
    packageFormik,
    handleEditPackage,
    handleDeletePackage,
  };
}
