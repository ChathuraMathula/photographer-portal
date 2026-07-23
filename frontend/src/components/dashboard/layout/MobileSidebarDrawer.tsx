"use client";
import React from "react";
import { MenuItem } from "./constants";
import { NavItem } from "./NavItem";
import { useDrawerAnimation } from "./hooks/useDrawerAnimation";
import { MobileSidebarHeader } from "./components/MobileSidebarHeader";
import { MobileSidebarFooter } from "./components/MobileSidebarFooter";

type MobileSidebarDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  items: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoutRequest: () => void;
};

export function MobileSidebarDrawer({
  isOpen,
  onClose,
  userName,
  items,
  activeTab,
  onTabChange,
  onLogoutRequest,
}: MobileSidebarDrawerProps) {
  const { mounted, animating } = useDrawerAnimation(isOpen);
  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${animating ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`relative flex flex-col justify-between w-64 max-w-xs bg-white border-r border-zinc-200 h-full p-4 shadow-2xl z-10 transition-transform duration-300 ease-in-out ${animating ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Mobile Navigation Drawer"
      >
        <div>
          <MobileSidebarHeader userName={userName} onClose={onClose} />
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
        <MobileSidebarFooter
          activeTab={activeTab}
          onTabChange={onTabChange}
          onClose={onClose}
          onLogoutRequest={onLogoutRequest}
        />
      </aside>
    </div>
  );
}
