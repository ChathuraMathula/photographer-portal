"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { PhotographerTopbarActions } from "@/components/dashboard/layout/PhotographerTopbarActions";
import { FloatingChatWidget } from "@/components/dashboard/floating-chat/FloatingChatWidget";
import { NotificationBell } from "@/components/dashboard/notification-bell/NotificationBell";
import { BookingDetailsModal } from "@/components/modals/BookingDetailsModal";
import { ManualBookingModal } from "@/components/modals/ManualBookingModal";
import { PackageFormModal } from "@/components/modals/PackageFormModal";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
import { useUserSettings } from "@/context/UserSettingsContext";

export function PhotographerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { start } = useTopLoadingBar();

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
    packages,
    universalDepositType,
    universalDepositValue,
    forceOpenChat,
    setForceOpenChat,
    showManualBookingInTopbar,
    showAcceptBookingsInTopbar,
  } = context;

  const activeTab = pathname.split("/").pop() as any;

  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (pathname.endsWith("/reservations") && params.has("id")) {
          return;
        }
      }
      setSelectedRes(null);
    }
  }, [pathname, setSelectedRes]);

  const { inAppNotificationsEnabled } = useUserSettings();

  const handleTabChange = (tab: string) => {
    start();
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
          inAppNotificationsEnabled={inAppNotificationsEnabled}
          onSelectReservation={(resId, type) => {
            const res = reservations.find((r) => r.id === resId);
            if (res) {
              setSelectedRes(res);
            }
            if (type === "chat") {
              setForceOpenChat((prev) => prev + 1);
            }
            router.push(`/dashboard/reservations?id=${resId}&fromNotification=true`);
          }}
        />
      }
      topbarActions={
        <PhotographerTopbarActions
          showAcceptBookingsInTopbar={showAcceptBookingsInTopbar}
          showManualBookingInTopbar={showManualBookingInTopbar}
          profileAvailability={profileAvailability}
          onToggleAvailability={handleToggleAvailability}
          onAddManualBooking={() => setShowManualModal(true)}
        />
      }
    >
      <div className="space-y-6">{children}</div>

      {calendarSelectedRes && (
        <BookingDetailsModal
          reservation={calendarSelectedRes}
          onClose={() => setCalendarSelectedRes(null)}
          onNavigateToReservation={(res) => {
            setSelectedRes(res);
            setCalendarSelectedRes(null);
            router.push(`/dashboard/reservations/${res.id}`);
          }}
        />
      )}
      {showManualModal && (
        <ManualBookingModal
          formik={manualFormik}
          onClose={() => setShowManualModal(false)}
          allowedEventTypes={allowedEventTypes}
          allowCustomEventTypes={allowCustomEventTypes}
          packages={packages}
          universalDepositType={universalDepositType}
          universalDepositValue={universalDepositValue}
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

      {selectedRes && (
        <FloatingChatWidget
          selectedRes={selectedRes}
          messages={messages}
          messageText={messageText}
          onMessageChange={setMessageText}
          onSend={handleSendChatMessage}
          chatDisabled={chatDisabled}
          forceOpen={forceOpenChat}
        />
      )}
    </DashboardLayout>
  );
}
