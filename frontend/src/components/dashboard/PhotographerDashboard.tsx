"use client";

import { usePhotographerDashboard } from "@/app/dashboard/hooks/usePhotographerDashboard";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";

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
  const [showFloatingChat, setShowFloatingChat] = useState(false);
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

  useEffect(() => {
    if (selectedRes) {
      setShowFloatingChat(true);
    } else {
      setShowFloatingChat(false);
    }
  }, [selectedRes]);

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
            onDayClick={(date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const dateStr = String(date.getDate()).padStart(2, "0");
              const formatted = `${year}-${month}-${dateStr}`;
              manualFormik.setFieldValue("date", formatted);
              setShowManualModal(true);
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
            router.push(`/dashboard/reservations?id=${res.id}`);
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

      {/* Floating Chat Widget */}
      {selectedRes && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 select-none">
          {showFloatingChat && (
            <div className="w-[340px] sm:w-[400px] shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in slide-in-from-bottom-4 duration-200">
              <ChatBox
                messages={messages}
                messageText={messageText}
                onMessageChange={setMessageText}
                onSend={handleSendChatMessage}
                disabled={chatDisabled}
                myRole="PHOTOGRAPHER"
                title={`Chat with ${selectedRes.customer.firstName}`}
                description={`Negotiating details for ${selectedRes.eventType}`}
              />
            </div>
          )}
          <button
            onClick={() => setShowFloatingChat(!showFloatingChat)}
            className="btn btn-primary rounded-full h-14 w-14 p-0 shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          >
            {showFloatingChat ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-white" />
                {messages.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
                    {messages.length}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
