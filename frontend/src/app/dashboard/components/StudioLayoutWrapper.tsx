"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/store/slices/authSlice";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { PhotographerTopbarActions } from "@/components/dashboard/layout/PhotographerTopbarActions";
import { FloatingChatWidget } from "@/components/dashboard/floating-chat/FloatingChatWidget";
import { NotificationBell } from "@/components/dashboard/notification-bell/NotificationBell";
import { BookingDetailsModal } from "@/components/modals/BookingDetailsModal";
import { ManualBookingModal } from "@/components/modals/ManualBookingModal";
import { PackageFormModal } from "@/components/modals/PackageFormModal";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import { usePhotographerDashboardContext } from "../context/PhotographerDashboardContext";
import {
  CalendarDays,
  LayoutDashboard,
  Package,
  UserCog,
  Users,
} from "lucide-react";

export function StudioLayoutWrapper({
  children,
  firstName,
  role,
}: {
  children: React.ReactNode;
  firstName: string;
  role: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { start } = useTopLoadingBar();
  const { inAppNotificationsEnabled } = useUserSettings();

  const context = usePhotographerDashboardContext();

  const activeTab = pathname.split("/").pop() as any;

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "reservations") router.push("/dashboard/reservations");
    else if (tab === "calendar") router.push("/dashboard/calendar");
    else if (tab === "photographers") router.push("/dashboard/photographers");
    else if (tab === "packages") router.push("/dashboard/packages");
    else if (tab === "profile") router.push("/dashboard/profile");
    else if (tab === "settings") router.push("/dashboard/settings");
    else router.push("/dashboard");
  };

  const handleLogout = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout error:", err);
    }
    dispatch(logout());
    window.location.href = "/portal/login";
  };

  const menuItems = [
    { id: "dashboard", label: "Studio Overview", icon: LayoutDashboard },
    { id: "reservations", label: "Reservations", icon: CalendarDays },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "photographers", label: "Team", icon: Users },
    { id: "packages", label: "Packages", icon: Package },
    { id: "profile", label: "Studio Profile", icon: UserCog },
  ];

  if (!context) {
    return (
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        userName={firstName}
        userRole={role}
        menuItems={menuItems}
      >
        {children}
      </DashboardLayout>
    );
  }

  const {
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
    selectedRes,
    messages,
    messageText,
    setMessageText,
    handleSendChatMessage,
    packages,
    universalDepositType,
    universalDepositValue,
    forceOpenChat,
    setForceOpenChat,
    showManualBookingInTopbar,
    showAcceptBookingsInTopbar,
  } = context;

  const isStaff = role === "STUDIO_PHOTOGRAPHER" || role === "STUDIO_STAFF";

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      userName={firstName}
      userRole={role}
      profileImageUrl={profileImageUrl}
      menuItems={menuItems}
      notificationBell={
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearAll={handleClearAllNotifications}
          inAppNotificationsEnabled={inAppNotificationsEnabled}
          onSelectReservation={(resId, type) => {
            if (type === "chat") {
              setForceOpenChat((prev) => prev + 1);
            }
            router.push(`/dashboard/reservations/${resId}`);
          }}
        />
      }
      topbarActions={
        isStaff ? null : (
          <PhotographerTopbarActions
            showAcceptBookingsInTopbar={showAcceptBookingsInTopbar}
            showManualBookingInTopbar={showManualBookingInTopbar}
            profileAvailability={profileAvailability}
            onToggleAvailability={handleToggleAvailability}
            onAddManualBooking={() => setShowManualModal(true)}
          />
        )
      }
    >
      <div className="space-y-6">{children}</div>

      {calendarSelectedRes && (
        <BookingDetailsModal
          reservation={calendarSelectedRes}
          onClose={() => setCalendarSelectedRes(null)}
          onNavigateToReservation={(res) => {
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

      {selectedRes && forceOpenChat > 0 && !pathname.includes("/dashboard/reservations") && (
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
