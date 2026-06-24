"use client";

import React from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { PhotographerDashboardProvider, usePhotographerDashboardContext } from "./context/PhotographerDashboardContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PhotographerBanner } from "@/components/dashboard/PhotographerBanner";
import { FloatingChatWidget } from "@/components/dashboard/FloatingChatWidget";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { BookingDetailsModal } from "@/components/dashboard/BookingDetailsModal";
import { ManualBookingModal } from "@/components/dashboard/ManualBookingModal";
import { PackageFormModal } from "@/components/dashboard/PackageFormModal";

function PhotographerLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const context = usePhotographerDashboardContext();
  if (!context) return null;

  const {
    firstName,
    role,
    reservations,
    selectedRes,
    setSelectedRes,
    messages,
    messageText,
    setMessageText,
    showManualModal,
    setShowManualModal,
    showPackageModal,
    setShowPackageModal,
    editingPkg,
    packageIncludesText,
    setPackageIncludesText,
    profileAvailability,
    handleToggleAvailability,
    manualFormik,
    packageFormik,
    chatDisabled,
    profileImageUrl,
    allowedEventTypes,
    allowCustomEventTypes,
    notifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClearAllNotifications,
    calendarSelectedRes,
    setCalendarSelectedRes,
    handleLogout,
    handleSendChatMessage,
  } = context;

  const activeTab = pathname.split("/").pop() as any;

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      userName={firstName ?? ""}
      userRole={role ?? ""}
      profileImageUrl={profileImageUrl}
      notificationBell={
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearAll={handleClearAllNotifications}
          onSelectReservation={(resId) => {
            const res = reservations.find((r) => r.id === resId);
            if (res) {
              setSelectedRes(res);
              router.push(`/dashboard/reservations?id=${resId}`);
            }
          }}
        />
      }
    >
      <div className="space-y-6">
        <PhotographerBanner
          firstName={firstName ?? ""}
          profileAvailability={profileAvailability}
          onToggleAvailability={handleToggleAvailability}
          onAddManualBooking={() => setShowManualModal(true)}
        />
        {children}
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
          allowedEventTypes={allowedEventTypes}
          allowCustomEventTypes={allowCustomEventTypes}
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

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (role === UserRole.PHOTOGRAPHER) {
    return (
      <PhotographerDashboardProvider>
        <PhotographerLayoutWrapper>{children}</PhotographerLayoutWrapper>
      </PhotographerDashboardProvider>
    );
  }

  return <>{children}</>;
}
