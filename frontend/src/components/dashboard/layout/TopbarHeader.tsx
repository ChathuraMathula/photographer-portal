import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";

type TopbarHeaderProps = {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  activeLabel: string;
  notificationBell?: React.ReactNode;
  topbarActions?: React.ReactNode;
  profileImageUrl?: string;
  userName: string;
  userRole: string;
  onTabChange: (tab: string) => void;
};

export function TopbarHeader({
  isCollapsed,
  setIsCollapsed,
  setIsMobileOpen,
  activeLabel,
  notificationBell,
  topbarActions,
  profileImageUrl,
  userName,
  userRole,
  onTabChange,
}: TopbarHeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-zinc-200/80 shrink-0 select-none z-20">
      <div className="flex items-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden lg:flex h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg mr-3 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
          className="flex lg:hidden h-9 w-9 items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded-lg mr-3 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="h-5 w-[1px] bg-zinc-200 mr-4 hidden lg:inline" />
        <h2 className="hidden md:block font-extrabold text-title-base tracking-tight text-zinc-900 title-font">
          {activeLabel}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {topbarActions}
        {notificationBell}
        <span className="h-8 w-[1px] bg-zinc-200" />
        <div
          onClick={() => {
            if (userRole === "PHOTOGRAPHER" || userRole === "STUDIO_PHOTOGRAPHER" || userRole === "STUDIO_STAFF") onTabChange("profile");
          }}
          title="View Profile"
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <UserAvatar
            src={profileImageUrl}
            name={userName}
            className="h-9 w-9 text-xs"
          />
        </div>
      </div>
    </header>
  );
}
