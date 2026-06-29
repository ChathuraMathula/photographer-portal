"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
import { PhotographerDashboardProvider, usePhotographerDashboardContext } from "./context/PhotographerDashboardContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PhotographerBanner } from "@/components/dashboard/PhotographerBanner";
import { FloatingChatWidget } from "@/components/dashboard/FloatingChatWidget";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { BookingDetailsModal } from "@/components/dashboard/BookingDetailsModal";
import { ManualBookingModal } from "@/components/dashboard/ManualBookingModal";
import { PackageFormModal } from "@/components/dashboard/PackageFormModal";
import { useTopLoadingBar } from "@/context/TopLoadingBarContext";
import { ADMIN_MENU } from "@/components/dashboard/AdminDashboard";
import { Settings, ClipboardList, LayoutDashboard, Users, BarChart3, UserCog } from "lucide-react";

function PhotographerLayoutWrapper({ children }: { children: React.ReactNode }) {
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
  } = context;

  const activeTab = pathname.split("/").pop() as any;

  // Track previous pathname so we only clear selectedRes on actual navigation,
  // not on initial mount or re-renders caused by context reference changes.
  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setSelectedRes(null);
    }
  }, [pathname, setSelectedRes]);

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
          onSelectReservation={(resId, type) => {
            const res = reservations.find((r) => r.id === resId);
            if (res) {
              setSelectedRes(res);
              if (type === "chat") {
                setForceOpenChat((prev) => prev + 1);
              }
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

      {/* Floating Chat Widget */}
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

function AdminLayoutWrapper({ children, firstName, role }: { children: React.ReactNode; firstName: string; role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { start } = useTopLoadingBar();

  const activeTab = pathname.split("/").pop() as any;

  const handleTabChange = (tab: string) => {
    start();
    if (tab === "overview") router.push("/dashboard");
    else if (tab === "reports") router.push("/dashboard/reports");
    else if (tab === "profile") router.push("/dashboard/profile");
    else if (tab === "settings") router.push("/dashboard/settings");
    else if (tab === "audit-logs") router.push("/dashboard/audit-logs");
    else router.push("/dashboard/users");
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
    window.location.href = "/login";
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile Details", icon: UserCog },
    { id: "settings", label: "User Settings", icon: Settings },
  ];

  if (role === UserRole.SUPER_ADMIN) {
    menuItems.push({ id: "audit-logs", label: "Audit Logs", icon: ClipboardList });
  }

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

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const { role, isAuthenticated, firstName } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-zinc-500 font-medium">Loading...</div>
      </div>
    );
  }

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

  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <AdminLayoutWrapper firstName={firstName ?? ""} role={role ?? ""}>
        {children}
      </AdminLayoutWrapper>
    );
  }

  return <>{children}</>;
}
