"use client";

import React, { useState } from "react";
import {
  Camera,
  CalendarCheck,
  CalendarDays,
  Layers,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
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
  { id: "profile",      label: "My Profile",   icon: User },
];

// ── Component ─────────────────────────────────────────────────────────────────

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

  const items      = menuItems ?? PHOTOGRAPHER_MENU;
  const activeItem = items.find((item) => item.id === activeTab);
  const activeLabel = activeItem ? activeItem.label : "Dashboard";

  const handleLogoutRequest = () => setShowLogoutModal(true);
  const handleLogoutConfirm = () => { setShowLogoutModal(false); onLogout(); };
  const handleLogoutCancel  = () => setShowLogoutModal(false);

  // ── Shared nav button renderer ─────────────────────────────────────────────

  const NavItem = ({
    item,
    collapsed,
    onClick,
  }: {
    item: MenuItem;
    collapsed: boolean;
    onClick: () => void;
  }) => {
    const Icon     = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-primary-dark text-white shadow-sm"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans antialiased text-zinc-900">

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-white border-r border-zinc-200/80 transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-30 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-4 border-b border-zinc-200/30 gap-3 overflow-hidden select-none">
            <div className="h-9 w-9 rounded-full bg-primary-dark shrink-0 flex items-center justify-center text-white shadow-inner">
              <Camera className="h-5 w-5" />
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
          <nav className="p-3 space-y-1.5 flex-1">
            {items.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                collapsed={isCollapsed}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200/50 space-y-1.5">
          <button
            id="sidebar-logout-btn"
            onClick={handleLogoutRequest}
            title={isCollapsed ? "Log out" : undefined}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="relative flex flex-col justify-between w-64 max-w-xs bg-white border-r border-zinc-200 h-full p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-dark flex items-center justify-center text-white">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-body-caption title-font tracking-tight">Photographer Portal</span>
                    <span className="text-body-caption text-zinc-400 truncate">{userName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Nav */}
              <nav className="space-y-1.5">
                {items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    collapsed={false}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileOpen(false);
                    }}
                  />
                ))}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="space-y-1.5 pt-4 border-t border-zinc-200/50">
              <button
                id="mobile-sidebar-logout-btn"
                onClick={handleLogoutRequest}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-zinc-200/80 shrink-0 select-none z-20">
          <div className="flex items-center">
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg mr-3 cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex lg:hidden h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg mr-3 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
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

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-zinc-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* ── Logout Confirmation Modal ─────────────────────────────────────── */}
      <LogoutConfirmModal
        open={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}
