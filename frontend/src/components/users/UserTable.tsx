import { type UserAccount } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTableRow } from "./UserTableRow";
import { Sparkles } from "lucide-react";

type Props = {
  users: UserAccount[];
  onToggleActive: (id: string) => Promise<void> | void;
  onDeleteUser?: (id: string) => Promise<void> | void;
  loggedInUserId: string;
  loggedInRole: string;
  unreadUserIds?: string[];
  onMarkAsRead?: (id: string) => void;
};

export function UserTable({
  users,
  onToggleActive,
  onDeleteUser,
  loggedInUserId,
  loggedInRole,
  unreadUserIds = [],
  onMarkAsRead,
}: Props) {
  const unreadCount = users.filter((u) => unreadUserIds.includes(u.id)).length;

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20 flex flex-row items-center justify-between">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white flex items-center gap-2">
          <span>Registered Users</span>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 animate-pulse">
              <Sparkles className="h-3 w-3" />
              {unreadCount} NEW SUBMISSIONS
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-small">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-body-small-s font-semibold">
                <th className="p-4">Name & Status</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Booking Info</th>
                <th className="p-4 text-right">Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 text-xs italic">
                    No registered users match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onToggleActive={onToggleActive}
                    onDeleteUser={onDeleteUser}
                    loggedInUserId={loggedInUserId}
                    loggedInRole={loggedInRole}
                    isUnread={unreadUserIds.includes(user.id)}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
