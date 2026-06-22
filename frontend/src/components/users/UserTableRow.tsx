import { type UserAccount } from "@/types";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Shield, Camera, CheckCircle, XCircle } from "lucide-react";

type Props = {
  user: UserAccount;
  onToggleActive: (id: string) => void;
};

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.SUPER_ADMIN)
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
        <Shield className="h-3 w-3" /> Super Admin
      </span>
    );
  if (role === UserRole.ADMIN)
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
        <Shield className="h-3 w-3" /> Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
      <Camera className="h-3 w-3" /> Photographer
    </span>
  );
}

export function UserTableRow({ user, onToggleActive }: Props) {
  return (
    <tr className="border-b border-zinc-100 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/20">
      <td className="p-4 font-semibold text-zinc-950 dark:text-white">
        {user.firstName} {user.lastName}
      </td>
      <td className="p-4 text-zinc-600 dark:text-zinc-350">{user.email}</td>
      <td className="p-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="p-4 text-zinc-500">{user.phone || "-"}</td>
      <td className="p-4">
        {user.profile?.bookingSlug ? (
          <a
            href={`/book/${user.profile.bookingSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-600 hover:underline dark:text-zinc-400"
          >
            slug: {user.profile.bookingSlug}
          </a>
        ) : (
          <span className="text-xs text-zinc-400">-</span>
        )}
      </td>
      <td className="p-4 text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleActive(user.id)}
          className={`h-8 gap-1 ${
            user.isActive
              ? "text-emerald-700 border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-950/30 dark:bg-emerald-950/10"
              : "text-zinc-500 hover:bg-zinc-100"
          }`}
        >
          {user.isActive ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" /> Active
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" /> Suspended
            </>
          )}
        </Button>
      </td>
    </tr>
  );
}
