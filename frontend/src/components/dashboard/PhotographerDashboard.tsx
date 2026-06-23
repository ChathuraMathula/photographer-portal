"use client";

import { usePhotographerDashboard } from "@/app/dashboard/hooks/usePhotographerDashboard";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Dashboard sub-components
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PhotographerBanner } from "@/components/dashboard/PhotographerBanner";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";
import { PackageGrid } from "@/components/dashboard/PackageGrid";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { ManualBookingModal } from "@/components/dashboard/ManualBookingModal";
import { PackageFormModal } from "@/components/dashboard/PackageFormModal";
import { BookingDetailsModal } from "@/components/dashboard/BookingDetailsModal";
import { ReservationsTabContent } from "@/components/dashboard/ReservationsTabContent";
import { FloatingChatWidget } from "@/components/dashboard/FloatingChatWidget";
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
    profileImageUrl,
    setProfileImageUrl,
    allowedEventTypes,
    setAllowedEventTypes,
    allowCustomEventTypes,
    setAllowCustomEventTypes,
    universalDepositType,
    setUniversalDepositType,
    universalDepositValue,
    setUniversalDepositValue,
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
          <ReservationsTabContent
            reservations={reservations}
            packages={packages}
            selectedRes={selectedRes}
            setSelectedRes={setSelectedRes}
            selectedPkgIds={selectedPkgIds}
            setSelectedPkgIds={setSelectedPkgIds}
            advanceAmount={advanceAmount}
            setAdvanceAmount={setAdvanceAmount}
            quotationNotes={quotationNotes}
            setQuotationNotes={setQuotationNotes}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            showRejectForm={showRejectForm}
            setShowRejectForm={setShowRejectForm}
            handleProposeQuotation={handleProposeQuotation}
            handleRejectRequest={handleRejectRequest}
          />
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
            onDateChange={setCurrentDate}
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
            profileImageUrl={profileImageUrl}
            onProfileImageUrlChange={setProfileImageUrl}
            allowedEventTypes={allowedEventTypes}
            onAllowedEventTypesChange={setAllowedEventTypes}
            allowCustomEventTypes={allowCustomEventTypes}
            onAllowCustomEventTypesChange={setAllowCustomEventTypes}
            universalDepositType={universalDepositType}
            universalDepositValue={universalDepositValue}
            onUniversalDepositTypeChange={setUniversalDepositType}
            onUniversalDepositValueChange={setUniversalDepositValue}
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
        <FloatingChatWidget
          selectedRes={selectedRes}
          messages={messages}
          messageText={messageText}
          onMessageChange={setMessageText}
          onSend={handleSendChatMessage}
          chatDisabled={chatDisabled}
        />
      )}
    </DashboardLayout>
  );
}
