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

type Props = {
  packages: Package[];
  selectedPkgIds: string[];
  advanceAmount: number;
  quotationNotes: string;
  showRejectForm: boolean;
  rejectionReason: string;
  onTogglePackage: (id: string, checked: boolean) => void;
  onAdvanceChange: (amount: number) => void;
  onNotesChange: (notes: string) => void;
  onShowRejectForm: () => void;
  onCancelReject: () => void;
  onRejectionReasonChange: (reason: string) => void;
  onPropose: () => void;
  onReject: () => void;
};

export function ProposeQuotationCard({
  packages,
  selectedPkgIds,
  advanceAmount,
  quotationNotes,
  showRejectForm,
  rejectionReason,
  onTogglePackage,
  onAdvanceChange,
  onNotesChange,
  onShowRejectForm,
  onCancelReject,
  onRejectionReasonChange,
  onPropose,
  onReject,
}: Props) {
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
          <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Choose Package Recommendations</Label>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl bg-zinc-50/20">
            {packages.length === 0 ? (
              <p className="text-body-small italic text-zinc-400">
                No packages. Create them in Packages tab first.
              </p>
            ) : (
              packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className="flex items-center gap-2 text-body-small-s p-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
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
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="advance" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Advance Payment (LKR)</Label>
            <Input
              id="advance"
              type="number"
              value={advanceAmount}
              onChange={(e) => onAdvanceChange(Number(e.target.value))}
              className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
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
                onClick={onReject}
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
              disabled={selectedPkgIds.length === 0}
              className="btn btn-primary h-10 px-4 py-0 min-w-0 md:min-w-0 text-body-small-s shadow-sm"
            >
              Send Proposal
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
