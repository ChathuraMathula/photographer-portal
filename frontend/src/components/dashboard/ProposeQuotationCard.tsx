import { useState } from "react";
import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomPackageModal, type CustomPackageValues } from "./CustomPackageModal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">
          Propose Quotation &amp; Lock Slot
        </CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Select packages to propose to this client. This locks the date for 24h.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Packages Multi-select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Choose Package Recommendations</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 px-3 text-xs border-dashed text-primary-dark border-primary-dark hover:bg-primary-dark/5 dark:text-white dark:border-zinc-800"
            >
              + Custom Package
            </Button>
          </div>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl bg-zinc-50/20">
            {packages.length === 0 && !customPackage ? (
              <p className="text-body-small italic text-zinc-400">
                No packages. Create standard packages or click custom package to define one.
              </p>
            ) : (
              <>
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors space-y-1"
                  >
                    <label className="flex items-center gap-2 text-body-small-s cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPkgIds.includes(pkg.id)}
                        onChange={(e) => onTogglePackage(pkg.id, e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-primary-dark focus:ring-primary-dark dark:border-zinc-700 dark:bg-zinc-950"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {pkg.name} - LKR{" "}
                        {(pkg.priceInCents / 100).toLocaleString()}
                      </span>
                    </label>
                    {selectedPkgIds.includes(pkg.id) && (
                      <div className="ml-6 flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500 font-medium">Custom Deposit (LKR):</span>
                        <input
                          type="number"
                          value={packageDeposits[pkg.id] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPackageDeposits((prev) => ({
                              ...prev,
                              [pkg.id]: val,
                            }));
                          }}
                          className="w-28 h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary-dark text-zinc-700 dark:text-zinc-300"
                          placeholder="Deposit LKR"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {customPackage && (
                  <div className="p-1.5 bg-primary-dark/5 dark:bg-zinc-800 border border-primary-dark/20 dark:border-zinc-800 rounded-lg space-y-1">
                    <label className="flex items-center gap-2 text-body-small-s cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCustomPackageSelected}
                        onChange={(e) => setIsCustomPackageSelected(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-primary-dark focus:ring-primary-dark dark:border-zinc-700 dark:bg-zinc-950"
                      />
                      <span className="text-primary-dark dark:text-primary-light font-semibold">
                        ⭐ [CUSTOM] {customPackage.name} - LKR {customPackage.price.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomPackage(null)}
                        className="ml-auto text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </label>
                    {isCustomPackageSelected && (
                      <div className="ml-6 flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500 font-medium">Custom Deposit (LKR):</span>
                        <input
                          type="number"
                          value={customPackageDeposit}
                          onChange={(e) => setCustomPackageDeposit(e.target.value)}
                          className="w-28 h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary-dark text-zinc-700 dark:text-zinc-300"
                          placeholder="Deposit LKR"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
        {showRejectForm ? (
          <div className="w-full space-y-3">
            <Input
              placeholder="Polite reason for rejection..."
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
              className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={onCancelReject}
                className="btn btn-secondary h-9 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s shadow-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectConfirm(true)}
                disabled={!rejectionReason.trim()}
                className="btn h-9 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s bg-destructive text-white hover:bg-destructive/90 border border-destructive shadow-sm"
              >
                Confirm Reject
              </Button>
            </div>
          </div>
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
              Send Proposal
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

      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-1">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-title-base text-zinc-900">
              Reject Reservation Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-small text-zinc-500 leading-relaxed">
              Are you sure you want to reject this reservation request? This action will cancel the request and notify the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowRejectConfirm(false);
                onReject();
              }}
              className="btn btn-danger btn-modal text-body-small-s h-11 cursor-pointer bg-red-650 hover:bg-red-750 text-white rounded-xl font-medium shadow-sm transition-all"
            >
              Yes, reject
            </button>
            <button
              type="button"
              onClick={() => setShowRejectConfirm(false)}
              className="btn btn-outline btn-modal text-body-small-s h-11 cursor-pointer border border-zinc-200 hover:bg-zinc-50 rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
