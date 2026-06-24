"use client";

import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { PackageGrid } from "@/components/dashboard/PackageGrid";

export default function PackagesPage() {
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const {
    packages,
    packageFormik,
    setEditingPkg,
    setPackageIncludesText,
    setShowPackageModal,
    handleEditPackage,
    handleDeletePackage,
  } = context;

  return (
    <PackageGrid
      packages={packages}
      onAddPackage={() => {
        setEditingPkg(null);
        packageFormik.resetForm();
        setPackageIncludesText("");
        setShowPackageModal(true);
      }}
      onEditPackage={handleEditPackage}
      onDeletePackage={handleDeletePackage}
    />
  );
}
