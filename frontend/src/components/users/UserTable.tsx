import { type UserAccount } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTableRow } from "./UserTableRow";

type Props = {
  users: UserAccount[];
  onToggleActive: (id: string) => Promise<void> | void;
  loggedInUserId: string;
  loggedInRole: string;
};

export function UserTable({ users, onToggleActive, loggedInUserId, loggedInRole }: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Registered Users</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-small">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-body-small-s font-semibold">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Booking Info</th>
                <th className="p-4 text-right">Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onToggleActive={onToggleActive}
                  loggedInUserId={loggedInUserId}
                  loggedInRole={loggedInRole}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
