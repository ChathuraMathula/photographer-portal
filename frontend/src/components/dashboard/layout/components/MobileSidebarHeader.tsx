import { Camera, X } from "lucide-react";

export function MobileSidebarHeader({
  userName,
  onClose,
}: {
  userName: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 mb-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary-dark flex items-center justify-center text-white">
          <Camera className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-body-caption title-font tracking-tight">
            Photographer Portal
          </span>
          <span className="text-body-caption text-zinc-400 truncate">
            {userName}
          </span>
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
  );
}
