"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Layers,
  User,
  CreditCard,
  BarChart3,
  Receipt,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/common/LogoutConfirmModal";
import { DesktopSidebar } from "./layout/DesktopSidebar";
import { MobileSidebarDrawer } from "./layout/MobileSidebarDrawer";
import { TopbarHeader } from "./layout/TopbarHeader";
import { useLockBodyScroll } from "./hooks/useLockBodyScroll";

// ── Types ────────────────────────────────────────────────────────────────────

export type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

type DashboardLayoutProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  children: React.ReactNode;
  /** Optional custom nav items. Defaults to photographer tabs. */
  menuItems?: MenuItem[];
  profileImageUrl?: string;
  notificationBell?: React.ReactNode;
  topbarActions?: React.ReactNode;
};

// ── Default photographer menu ─────────────────────────────────────────────────

const PHOTOGRAPHER_MENU: MenuItem[] = [
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "calendar",     label: "Calendar",     icon: CalendarDays },
  { id: "packages",     label: "Packages",     icon: Layers },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "reports",      label: "Reports & Analytics", icon: BarChart3 },
  { id: "invoices",     label: "Invoices",     icon: Receipt },
  { id: "profile",      label: "My Profile",   icon: User },
];

// ── Main Component ────────────────────────────────────────────────────────────

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
  const [isCollapsed, setIsCollapsed]       = useState(false);
  const [isMobileOpen, setIsMobileOpen]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem("sidebar_collapsed") === "true";
    if (collapsed) {
      setIsCollapsed(true);
    }
  }, []);

  const handleSetCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setIsCollapsed((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  useLockBodyScroll();

  const items      = menuItems ?? PHOTOGRAPHER_MENU;
  const activeItem = items.find((item) => item.id === activeTab);
  const activeLabel = activeItem ? activeItem.label : "Dashboard";

  const handleLogoutRequest = () => setShowLogoutModal(true);
  const handleLogoutConfirm = () => { setShowLogoutModal(false); onLogout(); };
  const handleLogoutCancel  = () => setShowLogoutModal(false);

  return (
    <div className="h-screen w-screen flex bg-zinc-50 font-sans antialiased text-zinc-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        userName={userName}
        userRole={userRole}
        items={items}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogoutRequest={handleLogoutRequest}
      />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        userName={userName}
        items={items}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogoutRequest={handleLogoutRequest}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
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

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-zinc-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}
