import { LogOut, Settings } from "lucide-react";

type Props = { isCollapsed: boolean; activeTab: string; onTabChange: (tab: string) => void; onLogoutRequest: () => void; };

export function DesktopSidebarFooter({ isCollapsed, activeTab, onTabChange, onLogoutRequest }: Props) {
  return (
    <div className="p-3 border-t border-zinc-200/50 space-y-1.5">
      <button
        onClick={() => onTabChange("settings")} title={isCollapsed ? "User Settings" : undefined} aria-label="User Settings"
        className={`flex items-center transition-all duration-300 cursor-pointer rounded-xl text-body-small-s font-medium ${activeTab === "settings" ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"} ${isCollapsed ? "w-10 h-10 mx-auto justify-center p-0" : "w-full gap-3.5 px-3.5 py-2.5"}`}
      >
        <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
        {!isCollapsed && <span className="truncate whitespace-nowrap">Settings</span>}
      </button>

      <button
        id="sidebar-logout-btn" onClick={onLogoutRequest} title={isCollapsed ? "Log out" : undefined} aria-label="Log out"
        className={`flex items-center transition-all duration-300 cursor-pointer rounded-xl text-body-small-s font-medium text-red-600 hover:bg-red-50 ${isCollapsed ? "w-10 h-10 mx-auto justify-center p-0" : "w-full gap-3.5 px-3.5 py-2.5"}`}
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        {!isCollapsed && <span className="truncate whitespace-nowrap">Log out</span>}
      </button>
    </div>
  );
}
