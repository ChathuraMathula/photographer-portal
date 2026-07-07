"use client";
import React from "react";
import { MenuItem } from "../DashboardLayout";
import { NavItem } from "./NavItem";
import { DesktopSidebarHeader } from "./components/DesktopSidebarHeader";
import { DesktopSidebarFooter } from "./components/DesktopSidebarFooter";

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
      className={`hidden lg:flex flex-col justify-between bg-white border-r border-zinc-200/80 transition-[width] duration-300 ease-in-out shrink-0 h-full z-30 overflow-hidden ${isCollapsed ? "w-16" : "w-64"}`}
      aria-label="Desktop Sidebar"
    >
      <div className="flex flex-col">
        <DesktopSidebarHeader
          isCollapsed={isCollapsed}
          userName={userName}
          userRole={userRole}
        />
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
      <DesktopSidebarFooter
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogoutRequest={onLogoutRequest}
      />
    </aside>
  );
}
