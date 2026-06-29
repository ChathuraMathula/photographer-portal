"use client";

import React, { useState, useEffect } from "react";
import { Camera, LogOut, X, Settings } from "lucide-react";
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
  // Track whether to keep the drawer mounted during close animation
  const [mounted, setMounted] = useState(isOpen);
  const [animating, setAnimating] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Double RAF ensures browser paints the initial hidden state before transitioning
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      return () => cancelAnimationFrame(id);
    } else {
      // Trigger exit animation then unmount after it completes
      setAnimating(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop — fades in/out */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — slides in/out */}
      <aside
        className={`relative flex flex-col justify-between w-64 max-w-xs bg-white border-r border-zinc-200 h-full p-4 shadow-2xl z-10 transition-transform duration-300 ease-in-out ${
          animating ? "translate-x-0" : "-translate-x-full"
        }`}
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
            onClick={() => {
              onTabChange("settings");
              onClose();
            }}
            aria-label="User Settings"
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "settings"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Settings</span>
          </button>

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
