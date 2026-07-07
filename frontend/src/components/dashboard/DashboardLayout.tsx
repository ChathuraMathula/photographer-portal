"use client";
import React from "react";
import { LogoutConfirmModal } from "@/components/modals/LogoutConfirmModal";
import { DesktopSidebar } from "./layout/DesktopSidebar";
import { MobileSidebarDrawer } from "./layout/MobileSidebarDrawer";
import { TopbarHeader } from "./layout/TopbarHeader";
import { useLockBodyScroll } from "./hooks/useLockBodyScroll";
import { useDashboardLayout } from "./hooks/useDashboardLayout";
import { PHOTOGRAPHER_MENU, type MenuItem } from "./layout/constants";
export type { MenuItem };

type DashboardLayoutProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  children: React.ReactNode;
  menuItems?: MenuItem[];
  profileImageUrl?: string;
  notificationBell?: React.ReactNode;
  topbarActions?: React.ReactNode;
};

export function DashboardLayout({
  activeTab,
  onTabChange,
  onLogout,
  userName,
  userRole,
  children,
  menuItems,
  profileImageUrl,
  notificationBell,
  topbarActions,
}: DashboardLayoutProps) {
  useLockBodyScroll();
  const {
    isCollapsed,
    handleSetCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    showLogoutModal,
    setShowLogoutModal,
    items,
    activeLabel,
  } = useDashboardLayout(activeTab, menuItems, PHOTOGRAPHER_MENU);

  return (
    <div className="h-screen w-screen flex bg-zinc-50 font-sans antialiased text-zinc-900 overflow-hidden">
      <DesktopSidebar
        isCollapsed={isCollapsed}
        userName={userName}
        userRole={userRole}
        items={items}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogoutRequest={() => setShowLogoutModal(true)}
      />
      <MobileSidebarDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        userName={userName}
        items={items}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogoutRequest={() => setShowLogoutModal(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopbarHeader
          isCollapsed={isCollapsed}
          setIsCollapsed={handleSetCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          activeLabel={activeLabel}
          notificationBell={notificationBell}
          topbarActions={topbarActions}
          profileImageUrl={profileImageUrl}
          userName={userName}
          userRole={userRole}
          onTabChange={onTabChange}
        />
        <main className="flex-1 overflow-y-auto focus:outline-none bg-zinc-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <LogoutConfirmModal
        open={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
