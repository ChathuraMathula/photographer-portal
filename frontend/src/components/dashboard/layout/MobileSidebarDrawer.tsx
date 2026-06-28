"use client";

import React from "react";
import { Camera, LogOut, X } from "lucide-react";
import { MenuItem } from "../DashboardLayout";
import { NavItem } from "./NavItem";

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
