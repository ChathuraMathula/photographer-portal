import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UserAccount } from "@/types";
import { UserRole } from "@/store/slices/authSlice";
import { Trash2, Eye, CheckCircle2, Sparkles } from "lucide-react";
import { RoleBadge } from "./components/RoleBadge";
import { ToggleStatusButton } from "./components/ToggleStatusButton";
import { SuspendConfirmModal } from "./components/SuspendConfirmModal";
import { DeleteUserConfirmModal } from "./components/DeleteUserConfirmModal";

type Props = {
  user: UserAccount;
  onToggleActive: (id: string) => void;
  onDeleteUser?: (id: string) => void;
  loggedInUserId: string;
  loggedInRole: string;
  isUnread?: boolean;
  onMarkAsRead?: (id: string) => void;
};

export function UserTableRow({
  user,
  onToggleActive,
  onDeleteUser,
  loggedInUserId,
  loggedInRole,
  isUnread = false,
  onMarkAsRead,
}: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentFirstName = user.firstName;
  const currentLastName = user.lastName;
  const currentSlug =
    user.role === UserRole.STUDIO
      ? user.studioSlug || ""
      : user.profile?.bookingSlug || "";

  const isDeactivating = user.isActive;
  const fullName = `${user.firstName} ${user.lastName}`;
  const isSelf = user.id === loggedInUserId;

  const canToggle =
    !isSelf &&
    (loggedInRole === UserRole.SUPER_ADMIN || (!user.isActive && loggedInRole === UserRole.ADMIN));

  const handleRowClick = () => {
    onMarkAsRead?.(user.id);
    router.push(`/dashboard/users/${user.id}`);
  };

  const handleConfirm = async () => {
    setToggling(true);
    try {
      await onToggleActive(user.id);
    } finally {
      setToggling(false);
      setShowConfirm(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteUser) return;
    setDeleting(true);
    try {
      await onDeleteUser(user.id);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <tr
        onClick={handleRowClick}
        className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-850/60 transition-colors cursor-pointer ${
          isUnread ? "bg-rose-50/30 dark:bg-rose-950/20" : ""
        }`}
      >
        <td className="p-4 text-body-small-s">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {currentFirstName} {currentLastName}
            </span>
            {isUnread && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse flex items-center gap-1 shadow-xs">
                <Sparkles className="h-2.5 w-2.5" />
                NEW
              </span>
            )}
          </div>
          {user.studioName && (
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
              {user.studioName}
            </span>
          )}
        </td>
        <td className="p-4 text-body-small-s text-zinc-600 dark:text-zinc-350">
          {user.email}
        </td>
        <td className="p-4">
          <RoleBadge role={user.role} />
        </td>
        <td className="p-4 text-body-small-s text-zinc-500">
          {user.phone || "-"}
        </td>
        <td className="p-4">
          <div className="flex flex-col gap-0.5">
            {user.username && (
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                @{user.username}
              </span>
            )}
            <div className="flex items-center gap-2">
              {currentSlug ? (
                <a
                  href={user.role === UserRole.STUDIO ? `/studios/${currentSlug}` : `/book/${currentSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-body-caption text-primary-light hover:text-primary-dark hover:underline dark:text-indigo-400 dark:hover:text-indigo-305 transition-colors font-semibold"
                >
                  {user.role === UserRole.STUDIO ? `studio: ${currentSlug}` : `slug: ${currentSlug}`}
                </a>
              ) : (
                <span className="text-body-caption text-zinc-400">-</span>
              )}
            </div>
          </div>
        </td>
        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            {/* View Details Button */}
            <Link
              href={`/dashboard/users/${user.id}`}
              onClick={() => onMarkAsRead?.(user.id)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 text-xs font-bold transition-all"
              title="Review User Details"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Details</span>
            </Link>

            {/* Toggle Status / Self Protection Badge */}
            {isSelf ? (
              <span
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 text-xs font-bold cursor-default"
                title="Current Logged In Super Admin (Self)"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>You (Active)</span>
              </span>
            ) : canToggle ? (
              <ToggleStatusButton
                isActive={user.isActive}
                isSelf={isSelf}
                onClick={() => setShowConfirm(true)}
              />
            ) : user.isActive && loggedInRole === UserRole.ADMIN ? (
              <span
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 text-xs font-bold cursor-not-allowed"
                title="Only Super Admins can suspend active accounts"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active</span>
              </span>
            ) : (
              <ToggleStatusButton
                isActive={user.isActive}
                isSelf={isSelf}
                onClick={() => {}}
              />
            )}

            {/* Delete User Button (Super Admin Only, Cannot Delete Self) */}
            {loggedInRole === UserRole.SUPER_ADMIN && !isSelf && onDeleteUser && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200/60 transition-colors cursor-pointer"
                title="Delete User (Super Admin Privilege)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>

      <SuspendConfirmModal
        open={showConfirm}
        isDeactivating={isDeactivating}
        fullName={fullName}
        loading={toggling}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <DeleteUserConfirmModal
        open={showDeleteConfirm}
        fullName={fullName}
        email={user.email}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
