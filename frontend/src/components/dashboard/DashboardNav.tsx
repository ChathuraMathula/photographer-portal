import { Button } from "@/components/ui/button";
import { Camera, LogOut } from "lucide-react";

type Tab = "reservations" | "calendar" | "packages" | "profile";

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "reservations", label: "Reservations" },
  { id: "calendar", label: "Calendar" },
  { id: "packages", label: "Packages" },
  { id: "profile", label: "Settings" },
];

export function DashboardNav({ activeTab, onTabChange, onLogout }: Props) {
  return (
    <nav className="bg-white border-b border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950">
            <Camera className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">
            Photographer Dashboard
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button
            size="icon"
            variant="ghost"
            onClick={onLogout}
            className="text-zinc-500"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
