"use client";

import React from "react";
import { MenuItem } from "../DashboardLayout";

type NavItemProps = {
  item: MenuItem;
  collapsed: boolean;
  activeTab: string;
  onClick: () => void;
};

export function NavItem({ item, collapsed, activeTab, onClick }: NavItemProps) {
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
