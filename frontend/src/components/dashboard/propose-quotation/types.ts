import { type Package } from "@/types";
import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";
import React from "react";

export type ProposeQuotationCardProps = {
  packages: Package[];
  selectedPkgIds: string[];
  quotationNotes: string;
  showRejectForm: boolean;
  rejectionReason: string;
  onTogglePackage: (id: string, checked: boolean) => void;
  onNotesChange: (notes: string) => void;
  onShowRejectForm: () => void;
  onCancelReject: () => void;
  onRejectionReasonChange: (reason: string) => void;
  onPropose: () => void;
  onReject: () => void;
  packageDeposits: Record<string, string>;
  setPackageDeposits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customPackage: CustomPackageValues | null;
  setCustomPackage: (val: CustomPackageValues | null) => void;
  customPackageDeposit: string;
  setCustomPackageDeposit: (val: string) => void;
  isCustomPackageSelected: boolean;
  setIsCustomPackageSelected: (val: boolean) => void;
  isEdit?: boolean;
};
