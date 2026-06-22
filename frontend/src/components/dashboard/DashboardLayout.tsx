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
  ChevronRight
} from "lucide-react";

type Tab = "reservations" | "calendar" | "packages" | "profile";

type DashboardLayoutProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  children: React.ReactNode;
};

const MENU_ITEMS = [
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "packages", label: "Packages", icon: Layers },
  { id: "profile", label: "My Profile", icon: User },
] as const;

export function DashboardLayout({
  activeTab,
  onTabChange,
  onLogout,
  userName,
  userRole,
  children,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeItem = MENU_ITEMS.find((item) => item.id === activeTab);
  const activeLabel = activeItem ? activeItem.label : "Dashboard";

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100">
      
      {/* ── Desktop Sidebar ────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-30 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-4 border-b border-zinc-250/20 gap-3 overflow-hidden select-none">
            <div className="h-9 w-9 rounded-full bg-primary-dark shrink-0 flex items-center justify-center text-white shadow-inner">
              <Camera className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm leading-none title-font tracking-tight">
                  Photographer Portal
                </span>
                <span className="text-[10px] text-zinc-400 font-medium mt-1 truncate">
                  {userName ? `${userName} / ${userRole}` : userRole}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 flex-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary-dark text-white shadow-sm dark:bg-primary-light"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-850/50 space-y-1.5">
          <button
            onClick={() => alert("Frequently Asked Questions coming soon!")}
            title={isCollapsed ? "FAQs" : undefined}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all duration-200 cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">FAQs</span>}
          </button>
          
          <button
            onClick={onLogout}
            title={isCollapsed ? "Log out" : undefined}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer Drawer ───────────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Container */}
          <aside className="relative flex flex-col justify-between w-64 max-w-xs bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Close Button & Brand Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-dark flex items-center justify-center text-white">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs title-font tracking-tight">Photographer Portal</span>
                    <span className="text-[9px] text-zinc-400 truncate">{userName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <nav className="space-y-1.5">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-primary-dark text-white dark:bg-primary-light"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="space-y-1.5 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button
                onClick={() => {
                  alert("Frequently Asked Questions coming soon!");
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all duration-200 cursor-pointer"
              >
                <HelpCircle className="h-5 w-5 shrink-0" />
                <span>FAQs</span>
              </button>
              
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0 select-none z-20">
          <div className="flex items-center">
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg mr-3 cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="flex md:hidden h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg mr-3 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-850 mr-4 hidden md:inline" />

            {/* Page Title */}
            <h2 className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white title-font">
              {activeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-800 dark:text-zinc-200 shadow-inner">
              {userName ? userName[0].toUpperCase() : "P"}
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
