import { type Reservation, type Package } from "@/types";
import { ReservationList } from "./ReservationList";
import { CustomerDetailsCard } from "./CustomerDetailsCard";
import { ProposeQuotationCard } from "./ProposeQuotationCard";
import { ProposalStatusCard } from "./ProposalStatusCard";

type Props = {
  reservations: Reservation[];
  packages: Package[];
  selectedRes: Reservation | null;
  setSelectedRes: (res: Reservation | null) => void;
  selectedPkgIds: string[];
  setSelectedPkgIds: React.Dispatch<React.SetStateAction<string[]>>;
  advanceAmount: number;
  setAdvanceAmount: (amount: number) => void;
  quotationNotes: string;
  setQuotationNotes: (notes: string) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  showRejectForm: boolean;
  setShowRejectForm: (show: boolean) => void;
  handleProposeQuotation: () => void;
  handleRejectRequest: () => void;
};

export function ReservationsTabContent({
  reservations,
  packages,
  selectedRes,
  setSelectedRes,
  selectedPkgIds,
  setSelectedPkgIds,
  advanceAmount,
  setAdvanceAmount,
  quotationNotes,
  setQuotationNotes,
  rejectionReason,
  setRejectionReason,
  showRejectForm,
  setShowRejectForm,
  handleProposeQuotation,
  handleRejectRequest,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left list */}
      <div className="lg:col-span-1">
        <ReservationList
          reservations={reservations}
          selectedId={selectedRes?.id}
          onSelect={(res) => {
            setSelectedRes(res);
            setShowRejectForm(false);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `/dashboard/reservations?id=${res.id}`);
            }
          }}
        />
      </div>

      {/* Right details pane */}
      <div className="lg:col-span-2 space-y-4">
        {selectedRes ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <CustomerDetailsCard reservation={selectedRes} />

            {selectedRes.status === "PENDING" && (
              <ProposeQuotationCard
                packages={packages}
                selectedPkgIds={selectedPkgIds}
                advanceAmount={advanceAmount}
                quotationNotes={quotationNotes}
                showRejectForm={showRejectForm}
                rejectionReason={rejectionReason}
                onTogglePackage={(id, checked) =>
                  setSelectedPkgIds((prev) =>
                    checked ? [...prev, id] : prev.filter((x) => x !== id)
                  )
                }
                onAdvanceChange={setAdvanceAmount}
                onNotesChange={setQuotationNotes}
                onShowRejectForm={() => setShowRejectForm(true)}
                onCancelReject={() => setShowRejectForm(false)}
                onRejectionReasonChange={setRejectionReason}
                onPropose={handleProposeQuotation}
                onReject={handleRejectRequest}
              />
            )}

            {(selectedRes.status === "PROPOSED" || selectedRes.status === "CONFIRMED") && (
              <ProposalStatusCard reservation={selectedRes} />
            )}
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center border border-dashed rounded-xl text-zinc-400 text-body-small-s">
            Select a reservation from the list to view details, proposal
            forms, and client chat thread.
          </div>
        )}
      </div>
    </div>
  );
}
