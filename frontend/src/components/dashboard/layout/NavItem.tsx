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
      className={`flex items-center transition-all duration-300 cursor-pointer rounded-xl font-medium text-body-small-s ${
        collapsed
          ? "w-10 h-10 mx-auto justify-center p-0"
          : "w-full gap-3.5 px-3.5 py-2.5"
      } ${
        isActive
          ? "bg-primary-dark text-white shadow-sm"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span
        className={`truncate ${
          collapsed ? "opacity-0 w-0 overflow-hidden transition-all duration-200" : "opacity-100"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}
