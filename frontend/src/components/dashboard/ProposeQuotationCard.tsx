import { useState } from "react";
import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomPackageModal, type CustomPackageValues } from "@/components/modals/CustomPackageModal";
import { ProposePackageList } from "./propose-quotation/components/ProposePackageList";
import { ProposeRejectForm } from "./propose-quotation/components/ProposeRejectForm";

type Props = {
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

export function ProposeQuotationCard({
  packages,
  selectedPkgIds,
  quotationNotes,
  showRejectForm,
  rejectionReason,
  onTogglePackage,
  onNotesChange,
  onShowRejectForm,
  onCancelReject,
  onRejectionReasonChange,
  onPropose,
  onReject,
  packageDeposits,
  setPackageDeposits,
  customPackage,
  setCustomPackage,
  customPackageDeposit,
  setCustomPackageDeposit,
  isCustomPackageSelected,
  setIsCustomPackageSelected,
  isEdit = false,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">
          {isEdit ? "Update Proposal & Reset Expiry" : "Propose Quotation & Lock Slot"}
        </CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          {isEdit 
            ? "Update proposed package recommendations. This resets the 24-hour expiration lock."
            : "Select packages to propose to this client. This locks the date for 24h."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProposePackageList
          packages={packages}
          selectedPkgIds={selectedPkgIds}
          onTogglePackage={onTogglePackage}
          packageDeposits={packageDeposits}
          setPackageDeposits={setPackageDeposits}
          customPackage={customPackage}
          setCustomPackage={setCustomPackage}
          isCustomPackageSelected={isCustomPackageSelected}
          setIsCustomPackageSelected={setIsCustomPackageSelected}
          customPackageDeposit={customPackageDeposit}
          setCustomPackageDeposit={setCustomPackageDeposit}
          onOpenCustomPackageModal={() => setIsModalOpen(true)}
        />

        <div className="space-y-2">
          <Label htmlFor="propNotes" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Quotation Note</Label>
          <Input
            id="propNotes"
            placeholder="Any note to client..."
            value={quotationNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
        {showRejectForm ? (
          <ProposeRejectForm
            rejectionReason={rejectionReason}
            onRejectionReasonChange={onRejectionReasonChange}
            onCancelReject={onCancelReject}
            onReject={onReject}
            showRejectConfirm={showRejectConfirm}
            setShowRejectConfirm={setShowRejectConfirm}
          />
        ) : (
          <>
            <Button
              variant="outline"
              className="btn btn-secondary text-red-650 hover:text-red-700 h-10 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s border-zinc-200 dark:border-zinc-800"
              onClick={onShowRejectForm}
            >
              Reject Request
            </Button>
            <Button
              onClick={onPropose}
              disabled={selectedPkgIds.length === 0 && !(customPackage && isCustomPackageSelected)}
              className="btn btn-primary h-10 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s shadow-sm"
            >
              {isEdit ? "Update Proposal" : "Send Proposal"}
            </Button>
          </>
        )}
      </CardFooter>

      <CustomPackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values) => {
          setCustomPackage(values);
          setIsCustomPackageSelected(true);
        }}
      />
    </Card>
  );
}
