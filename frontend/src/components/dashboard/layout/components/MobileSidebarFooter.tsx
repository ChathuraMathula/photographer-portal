import { LogOut, Settings } from "lucide-react";

type Props = { activeTab: string; onTabChange: (tab: string) => void; onClose: () => void; onLogoutRequest: () => void; };

export function MobileSidebarFooter({ activeTab, onTabChange, onClose, onLogoutRequest }: Props) {
  return (
    <div className="space-y-1.5 pt-4 border-t border-zinc-200/50">
      <button
        onClick={() => { onTabChange("settings"); onClose(); }}
        aria-label="User Settings"
        className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-body-small-s font-medium transition-all duration-200 cursor-pointer ${activeTab === "settings" ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"}`}
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
  );
}
