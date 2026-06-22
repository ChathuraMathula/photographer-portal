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
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">
          Propose Quotation &amp; Lock Slot
        </CardTitle>
        <CardDescription>
          Select packages to propose to this client. This locks the date for 24h.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Packages Multi-select */}
        <div className="space-y-2">
          <Label>Choose Package Recommendations</Label>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 p-2 rounded">
            {packages.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">
                No packages. Create them in Packages tab first.
              </p>
            ) : (
              packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className="flex items-center gap-2 text-xs p-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedPkgIds.includes(pkg.id)}
                    onChange={(e) => onTogglePackage(pkg.id, e.target.checked)}
                  />
                  <span>
                    {pkg.name} - LKR{" "}
                    {(pkg.priceInCents / 100).toLocaleString()}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="advance">Advance Payment (LKR)</Label>
            <Input
              id="advance"
              type="number"
              value={advanceAmount}
              onChange={(e) => onAdvanceChange(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propNotes">Quotation Note</Label>
            <Input
              id="propNotes"
              placeholder="Any note to client..."
              value={quotationNotes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 border-t pt-3 dark:border-zinc-800">
        {showRejectForm ? (
          <div className="w-full space-y-2">
            <Input
              placeholder="Polite reason for rejection..."
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={onCancelReject}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={onShowRejectForm}
            >
              Reject Request
            </Button>
            <Button
              onClick={onPropose}
              disabled={selectedPkgIds.length === 0}
            >
              Send Proposal
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
