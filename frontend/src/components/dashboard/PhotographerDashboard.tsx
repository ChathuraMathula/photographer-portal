"use client";

import { usePhotographerDashboard } from "@/app/dashboard/hooks/usePhotographerDashboard";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Dashboard sub-components
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PhotographerBanner } from "@/components/dashboard/PhotographerBanner";
import { ReservationList } from "@/components/dashboard/ReservationList";
import { CustomerDetailsCard } from "@/components/dashboard/CustomerDetailsCard";
import { ProposeQuotationCard } from "@/components/dashboard/ProposeQuotationCard";
import { ProposalStatusCard } from "@/components/dashboard/ProposalStatusCard";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";
import { PackageGrid } from "@/components/dashboard/PackageGrid";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { ManualBookingModal } from "@/components/dashboard/ManualBookingModal";
import { PackageFormModal } from "@/components/dashboard/PackageFormModal";
import { ChatBox } from "@/components/common/ChatBox";
import { BookingDetailsModal } from "@/components/dashboard/BookingDetailsModal";
import { type Reservation } from "@/types";

type Props = {
  activeTab: "reservations" | "calendar" | "packages" | "profile";
};

export function PhotographerDashboard({ activeTab }: Props) {
  const router = useRouter();
  const [calendarSelectedRes, setCalendarSelectedRes] = useState<Reservation | null>(null);
  const {
    firstName,
    role,
    isAuthenticated,
    reservations,
    packages,
    selectedRes,
    setSelectedRes,
    messages,
    messageText,
    setMessageText,
    chatEndRef,
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
    showManualModal,
    setShowManualModal,
    showPackageModal,
    setShowPackageModal,
    editingPkg,
    setEditingPkg,
    packageIncludesText,
    setPackageIncludesText,
    profileBio,
    setProfileBio,
    profileLocation,
    setProfileLocation,
    profilePortfolio,
    setProfilePortfolio,
    profileAvailability,
    bookingSlug,
    currentDate,
    setCurrentDate,
    handleLogout,
    handleSendChatMessage,
    handleProposeQuotation,
    handleRejectRequest,
    handleSaveProfile,
    handleToggleAvailability,
    handleEditPackage,
    handleDeletePackage,
    manualFormik,
    packageFormik,
    chatDisabled,
  } = usePhotographerDashboard();

  useEffect(() => {
    if (isAuthenticated && (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, role, router]);

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  if (!isAuthenticated || role !== UserRole.PHOTOGRAPHER) {
    return null; // Let the auth guard in the hook handle redirecting
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      userName={firstName ?? ""}
      userRole={role ?? ""}
    >
      <div className="space-y-6">
        <PhotographerBanner
          firstName={firstName ?? ""}
          profileAvailability={profileAvailability}
          onToggleAvailability={handleToggleAvailability}
          onAddManualBooking={() => setShowManualModal(true)}
        />

        {/* ── Reservations Tab ── */}
        {activeTab === "reservations" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left list */}
            <div className="lg:col-span-1">
              <ReservationList
                reservations={reservations}
                selectedId={selectedRes?.id}
                onSelect={(res) => {
                  setSelectedRes(res);
                  setShowRejectForm(false);
                }}
              />
            </div>

            {/* Right details pane */}
            <div className="lg:col-span-2 space-y-4">
              {selectedRes ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  {/* Summary & Actions */}
                  <div className="space-y-4">
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

                  {/* Chat */}
                  <ChatBox
                    messages={messages}
                    messageText={messageText}
                    onMessageChange={setMessageText}
                    onSend={handleSendChatMessage}
                    disabled={chatDisabled}
                    myRole="PHOTOGRAPHER"
                    title="Live Chat with Customer"
                    description="Negotiate event details directly"
                  />
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border border-dashed rounded-xl text-zinc-400 text-sm">
                  Select a reservation from the list to view details, proposal
                  forms, and client chat thread.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Calendar Tab ── */}
        {activeTab === "calendar" && (
          <BookingCalendar
            reservations={reservations}
            currentDate={currentDate}
            onPrevMonth={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              )
            }
            onDayReservationClick={(res) => {
              setCalendarSelectedRes(res);
            }}
          />
        )}

        {/* ── Packages Tab ── */}
        {activeTab === "packages" && (
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
        )}

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <ProfileSettingsForm
            bio={profileBio}
            location={profileLocation}
            portfolio={profilePortfolio}
            bookingSlug={bookingSlug}
            onBioChange={setProfileBio}
            onLocationChange={setProfileLocation}
            onPortfolioChange={setProfilePortfolio}
            onSubmit={handleSaveProfile}
          />
        )}
      </div>

      {/* Modals */}
      {calendarSelectedRes && (
        <BookingDetailsModal
          reservation={calendarSelectedRes}
          onClose={() => setCalendarSelectedRes(null)}
          onNavigateToReservation={(res) => {
            setSelectedRes(res);
            setCalendarSelectedRes(null);
            router.push("/dashboard/reservations");
          }}
        />
      )}
      {showManualModal && (
        <ManualBookingModal
          formik={manualFormik}
          onClose={() => setShowManualModal(false)}
        />
      )}
      {showPackageModal && (
        <PackageFormModal
          formik={packageFormik}
          editingPkg={editingPkg}
          includesText={packageIncludesText}
          onIncludesChange={setPackageIncludesText}
          onClose={() => setShowPackageModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
