import { useState, useEffect } from "react";
import { type MenuItem } from "../layout/constants";

export function useDashboardLayout(
  activeTab: string,
  menuItems?: MenuItem[],
  defaultMenu: MenuItem[] = [],
) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem("sidebar_collapsed") === "true";
    if (collapsed) {
      setIsCollapsed(true);
    }
  }, []);

  const handleSetCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setIsCollapsed((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const items = menuItems ?? defaultMenu;
  const activeItem = items.find((item) => item.id === activeTab);
  const activeLabel = activeItem ? activeItem.label : "Dashboard";

  return {
    isCollapsed,
    handleSetCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    showLogoutModal,
    setShowLogoutModal,
    items,
    activeLabel,
  };
}
