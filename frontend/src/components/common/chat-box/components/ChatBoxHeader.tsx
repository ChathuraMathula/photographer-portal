import { MessageSquare } from "lucide-react";

type Props = { unreadCount: number; title: string; description: string; };

export function ChatBoxHeader({ unreadCount, title, description }: Props) {
  return (
    <div className="pb-3 px-4 pt-4 border-b border-zinc-100 dark:border-zinc-800">
      <h3 className="text-body-small-s font-bold flex items-center gap-1.5">
        <div className="relative flex items-center justify-center">
          <MessageSquare className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-bold h-3 w-3 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {title}
      </h3>
      <p className="text-body-caption text-zinc-550 mt-0.5">{description}</p>
    </div>
  );
}
