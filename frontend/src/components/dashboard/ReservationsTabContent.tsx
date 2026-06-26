import { type Reservation, type Package } from "@/types";
import { ReservationList } from "./ReservationList";
import { CustomerDetailsCard } from "./CustomerDetailsCard";
import { ProposeQuotationCard } from "./ProposeQuotationCard";
import { ProposalStatusCard } from "./ProposalStatusCard";
import { type CustomPackageValues } from "./CustomPackageModal";

type Props = {
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
  setPackageDeposits: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customPackage: CustomPackageValues | null;
  setCustomPackage: (val: CustomPackageValues | null) => void;
  customPackageDeposit: string;
  setCustomPackageDeposit: (val: string) => void;
  isCustomPackageSelected: boolean;
  setIsCustomPackageSelected: (val: boolean) => void;
};

export function ReservationsTabContent({
  reservations,
  packages,
  selectedRes,
  setSelectedRes,
  selectedPkgIds,
  setSelectedPkgIds,
  quotationNotes,
  setQuotationNotes,
  rejectionReason,
  setRejectionReason,
  showRejectForm,
  setShowRejectForm,
  handleProposeQuotation,
  handleRejectRequest,
  packageDeposits,
  setPackageDeposits,
  customPackage,
  setCustomPackage,
  customPackageDeposit,
  setCustomPackageDeposit,
  isCustomPackageSelected,
  setIsCustomPackageSelected,
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

            {(selectedRes.status === "PENDING" || selectedRes.status === "PROPOSED") && (
              <ProposeQuotationCard
                packages={packages}
                selectedPkgIds={selectedPkgIds}
                quotationNotes={quotationNotes}
                showRejectForm={showRejectForm}
                rejectionReason={rejectionReason}
                onTogglePackage={(id, checked) => {
                  if (checked) {
                    setSelectedPkgIds((prev) => [...prev, id]);
                  } else {
                    setSelectedPkgIds((prev) => prev.filter((x) => x !== id));
                  }
                }}
                onNotesChange={setQuotationNotes}
                onShowRejectForm={() => setShowRejectForm(true)}
                onCancelReject={() => setShowRejectForm(false)}
                onRejectionReasonChange={setRejectionReason}
                onPropose={handleProposeQuotation}
                onReject={handleRejectRequest}
                packageDeposits={packageDeposits}
                setPackageDeposits={setPackageDeposits}
                customPackage={customPackage}
                setCustomPackage={setCustomPackage}
                customPackageDeposit={customPackageDeposit}
                setCustomPackageDeposit={setCustomPackageDeposit}
                isCustomPackageSelected={isCustomPackageSelected}
                setIsCustomPackageSelected={setIsCustomPackageSelected}
                isEdit={selectedRes.status === "PROPOSED"}
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
