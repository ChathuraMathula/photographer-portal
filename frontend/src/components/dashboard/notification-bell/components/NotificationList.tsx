import React from "react";
import { type NotificationItem } from "@/types";
import { MessageSquare, Calendar, Bell } from "lucide-react";
import { formatTime } from "../utils/dateUtils";

type Props = {
  notifications: NotificationItem[];
  onNotificationClick: (item: NotificationItem) => void;
};

export function NotificationList({
  notifications,
  onNotificationClick,
}: Props) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <Bell className="h-8 w-8 text-zinc-350 dark:text-zinc-600 mb-2" />
        <p className="text-body-caption font-semibold text-zinc-400">
          All caught up!
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5">
          No recent notifications received.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
      {notifications.map((item) => (
        <div
          key={item.id}
          onClick={() => onNotificationClick(item)}
          className={`flex gap-3 p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-950/40 cursor-pointer transition-colors relative items-start ${
            !item.read ? "bg-zinc-50/20 dark:bg-zinc-950/10" : ""
          }`}
        >
          {!item.read && (
            <span className="absolute left-2.5 top-5 h-2 w-2 rounded-full bg-[#0e2d5c] dark:bg-white" />
          )}

          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              item.type === "chat"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
            }`}
          >
            {item.type === "chat" ? (
              <MessageSquare className="h-4 w-4" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-body-caption font-bold text-zinc-900 dark:text-white truncate">
              {item.title}
            </p>
            <p className="text-[11px] text-zinc-500 leading-normal line-clamp-2">
              {item.description}
            </p>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-500 block font-medium">
              {formatTime(item.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
