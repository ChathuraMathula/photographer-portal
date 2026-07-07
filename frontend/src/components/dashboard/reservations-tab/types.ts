import React from "react";
import { type Reservation, type Package } from "@/types";
import { type CustomPackageValues } from "@/components/modals/CustomPackageModal";

export type ReservationsTabContentProps = {
  reservations: Reservation[];
  packages: Package[];
  selectedRes: Reservation | null;
  setSelectedRes: (res: Reservation | null) => void;
  selectedPkgIds: string[];
  setSelectedPkgIds: React.Dispatch<React.SetStateAction<string[]>>;
  quotationNotes: string;
  setQuotationNotes: (notes: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  showRejectForm: boolean;
  setShowRejectForm: (show: boolean) => void;
  handleProposeQuotation: () => void;
  handleRejectRequest: () => void;
  packageDeposits: Record<string, string>;
  setPackageDeposits: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  customPackage: CustomPackageValues | null;
  setCustomPackage: (val: CustomPackageValues | null) => void;
  customPackageDeposit: string;
  setCustomPackageDeposit: (val: string) => void;
  isCustomPackageSelected: boolean;
  setIsCustomPackageSelected: (val: boolean) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  total: number;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
  reservationsLoading: boolean;
};
