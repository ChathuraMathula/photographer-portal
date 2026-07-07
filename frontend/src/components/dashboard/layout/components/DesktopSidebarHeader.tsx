import { Camera } from "lucide-react";

export function DesktopSidebarHeader({ isCollapsed, userName, userRole }: { isCollapsed: boolean, userName: string, userRole: string }) {
  return (
    <div className="h-16 flex items-center px-4 border-b border-zinc-200/30 gap-3 select-none">
      <div className="h-9 w-9 rounded-full bg-primary-dark shrink-0 flex items-center justify-center text-white shadow-inner">
        <Camera className="h-5 w-5" aria-hidden="true" />
      </div>
      {!isCollapsed && (
        <div className="flex flex-col truncate">
          <span className="font-bold text-body-small-s leading-none title-font tracking-tight whitespace-nowrap">Photographer Portal</span>
          <span className="text-body-caption text-zinc-400 font-medium mt-1 truncate">{userName ? `${userName} · ${userRole}` : userRole}</span>
        </div>
      )}
    </div>
  );
}
