"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  CalendarCheck,
  CalendarDays,
  Layers,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { LogoutConfirmModal } from "@/components/common/LogoutConfirmModal";

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
};

// ── Default photographer menu ─────────────────────────────────────────────────

const PHOTOGRAPHER_MENU: MenuItem[] = [
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "calendar",     label: "Calendar",     icon: CalendarDays },
  { id: "packages",     label: "Packages",     icon: Layers },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "profile",      label: "My Profile",   icon: User },
];

// ── Sub-components ───────────────────────────────────────────────────────────

type NavItemProps = {
  item: MenuItem;
  collapsed: boolean;
  activeTab: string;
  onClick: () => void;
};

function NavItem({ item, collapsed, activeTab, onClick }: NavItemProps) {
  const Icon = item.icon;
  const isActive = activeTab === item.id;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-primary-dark text-white shadow-sm"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

type DesktopSidebarProps = {
  isCollapsed: boolean;
  userName: string;
  userRole: string;
  items: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoutRequest: () => void;
};

function DesktopSidebar({
  isCollapsed,
  userName,
  userRole,
  items,
  activeTab,
  onTabChange,
  onLogoutRequest,
}: DesktopSidebarProps) {
  return (
    <aside
      className={`hidden lg:flex flex-col justify-between bg-white border-r border-zinc-200/80 transition-all duration-300 ease-in-out shrink-0 h-full z-30 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      aria-label="Desktop Sidebar"
    >
      <div className="flex flex-col">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-200/30 gap-3 overflow-hidden select-none">
          <div className="h-9 w-9 rounded-full bg-primary-dark shrink-0 flex items-center justify-center text-white shadow-inner">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-body-small-s leading-none title-font tracking-tight">
                Photographer Portal
              </span>
              <span className="text-body-caption text-zinc-400 font-medium mt-1 truncate">
                {userName ? `${userName} · ${userRole}` : userRole}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 flex-1" aria-label="Main Navigation">
          {items.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={isCollapsed}
              activeTab={activeTab}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-zinc-200/50 space-y-1.5">
        <button
          id="sidebar-logout-btn"
          onClick={onLogoutRequest}
          title={isCollapsed ? "Log out" : undefined}
          aria-label="Log out"
          className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="truncate">Log out</span>}
        </button>
      </div>
    </aside>
  );
}

type MobileSidebarDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  items: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoutRequest: () => void;
};

function MobileSidebarDrawer({
  isOpen,
  onClose,
  userName,
  items,
  activeTab,
  onTabChange,
  onLogoutRequest,
}: MobileSidebarDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="relative flex flex-col justify-between w-64 max-w-xs bg-white border-r border-zinc-200 h-full p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-300"
        aria-label="Mobile Navigation Drawer"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-dark flex items-center justify-center text-white">
                <Camera className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-body-caption title-font tracking-tight">Photographer Portal</span>
                <span className="text-body-caption text-zinc-400 truncate">{userName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Nav */}
          <nav className="space-y-1.5" aria-label="Mobile Navigation">
            {items.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                collapsed={false}
                activeTab={activeTab}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
              />
            ))}
          </nav>
        </div>

        {/* Mobile Footer */}
        <div className="space-y-1.5 pt-4 border-t border-zinc-200/50">
          <button
            id="mobile-sidebar-logout-btn"
            onClick={onLogoutRequest}
            aria-label="Log out"
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

type TopbarHeaderProps = {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  activeLabel: string;
  notificationBell?: React.ReactNode;
  profileImageUrl?: string;
  userName: string;
  userRole: string;
  onTabChange: (tab: string) => void;
};

function TopbarHeader({
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen,
  activeLabel,
  notificationBell,
  profileImageUrl,
  userName,
  userRole,
  onTabChange,
}: TopbarHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-zinc-200/80 shrink-0 select-none z-20">
      <div className="flex items-center">
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg mr-3 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
          className="flex lg:hidden h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg mr-3 cursor-pointer"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="h-5 w-[1px] bg-zinc-200 mr-4 hidden lg:inline" />

        {/* Page title */}
        <h2 className="font-extrabold text-title-base tracking-tight text-zinc-900 title-font">
          {activeLabel}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {notificationBell}
        <span className="h-8 w-[1px] bg-zinc-200" />
        <div
          onClick={() => {
            if (userRole === "PHOTOGRAPHER") {
              onTabChange("profile");
            }
          }}
          title={userRole === "PHOTOGRAPHER" ? "View Profile" : undefined}
          className={`h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-body-small-s text-zinc-800 shadow-inner overflow-hidden ${
            userRole === "PHOTOGRAPHER" ? "cursor-pointer hover:bg-zinc-200 transition-colors" : ""
          }`}
        >
          {profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileImageUrl}
              alt="Profile"
              className="h-full w-full object-cover animate-in fade-in duration-100"
            />
          ) : (
            userName ? userName[0].toUpperCase() : "P"
          )}
        </div>
      </div>
    </header>
  );
}

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
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed]       = useState(false);
  const [isMobileOpen, setIsMobileOpen]     = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Save original styles
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlHeight = document.documentElement.style.height;
    const origBodyHeight = document.body.style.height;

    // Lock html and body overflow to hidden and height to 100%
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";

    return () => {
      // Restore original styles on unmount
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.height = origHtmlHeight;
      document.body.style.height = origBodyHeight;
    };
  }, []);

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
          setIsCollapsed={setIsCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          activeLabel={activeLabel}
          notificationBell={notificationBell}
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
