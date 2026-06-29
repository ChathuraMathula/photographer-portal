"use client";

import React from "react";
import { Camera, LogOut, Settings } from "lucide-react";
import { MenuItem } from "../DashboardLayout";
import { NavItem } from "./NavItem";

type DesktopSidebarProps = {
  isCollapsed: boolean;
  userName: string;
  userRole: string;
  items: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoutRequest: () => void;
};

export function DesktopSidebar({
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
      className={`hidden lg:flex flex-col justify-between bg-white border-r border-zinc-200/80 transition-[width] duration-300 ease-in-out shrink-0 h-full z-30 overflow-hidden ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      aria-label="Desktop Sidebar"
    >
      <div className="flex flex-col">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-200/30 gap-3 select-none">
          <div className="h-9 w-9 rounded-full bg-primary-dark shrink-0 flex items-center justify-center text-white shadow-inner">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-body-small-s leading-none title-font tracking-tight whitespace-nowrap">
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
          onClick={() => onTabChange("settings")}
          title={isCollapsed ? "User Settings" : undefined}
          aria-label="User Settings"
          className={`flex items-center transition-all duration-300 cursor-pointer rounded-xl text-body-small-s font-medium ${
            activeTab === "settings"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50"
          } ${
            isCollapsed
              ? "w-10 h-10 mx-auto justify-center p-0"
              : "w-full gap-3.5 px-3.5 py-2.5"
          }`}
        >
          <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="truncate whitespace-nowrap">Settings</span>}
        </button>

        <button
          id="sidebar-logout-btn"
          onClick={onLogoutRequest}
          title={isCollapsed ? "Log out" : undefined}
          aria-label="Log out"
          className={`flex items-center transition-all duration-300 cursor-pointer rounded-xl text-body-small-s font-medium text-red-600 hover:bg-red-50 ${
            isCollapsed
              ? "w-10 h-10 mx-auto justify-center p-0"
              : "w-full gap-3.5 px-3.5 py-2.5"
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="truncate whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
