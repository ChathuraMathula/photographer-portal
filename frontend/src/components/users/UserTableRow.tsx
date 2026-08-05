import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type UserAccount } from "@/types";
import { UserRole } from "@/store/slices/authSlice";
import { Edit2, Trash2, Eye, ShieldAlert } from "lucide-react";
import { EditUserDetailsModal } from "@/components/modals/EditUserDetailsModal";
import { RoleBadge } from "./components/RoleBadge";
import { ToggleStatusButton } from "./components/ToggleStatusButton";
import { SuspendConfirmModal } from "./components/SuspendConfirmModal";

type Props = {
  user: UserAccount;
  onToggleActive: (id: string) => void;
  onDeleteUser?: (id: string) => void;
  loggedInUserId: string;
  loggedInRole: string;
};

export function UserTableRow({
  user,
  onToggleActive,
  onDeleteUser,
  loggedInUserId,
  loggedInRole,
}: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentFirstName, setCurrentFirstName] = useState(user.firstName);
  const [currentLastName, setCurrentLastName] = useState(user.lastName);
  const [currentSlug, setCurrentSlug] = useState(
    user.role === UserRole.STUDIO
      ? user.studioSlug || ""
      : user.profile?.bookingSlug || "",
  );

  const isDeactivating = user.isActive;
  const fullName = `${user.firstName} ${user.lastName}`;
  const isSelf = user.id === loggedInUserId;

  const canToggle =
    !isSelf &&
    (loggedInRole === UserRole.SUPER_ADMIN || (!user.isActive && loggedInRole === UserRole.ADMIN));

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
        onClick={() => router.push(`/dashboard/users/${user.id}`)}
        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-850/60 transition-colors cursor-pointer"
      >
        <td className="p-4 text-body-small-s">
          <span className="font-semibold text-zinc-900 dark:text-white block">
            {currentFirstName} {currentLastName}
          </span>
          {user.studioName && (
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
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
                  className="text-body-caption text-primary-light hover:text-primary-dark hover:underline dark:text-indigo-400 dark:hover:text-indigo-305 transition-colors font-semibold"
                >
                  {user.role === UserRole.STUDIO ? `studio: ${currentSlug}` : `slug: ${currentSlug}`}
                </a>
              ) : (
                <span className="text-body-caption text-zinc-400">-</span>
              )}
              {loggedInRole === UserRole.SUPER_ADMIN &&
                user.role === UserRole.PHOTOGRAPHER && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1 text-zinc-400 hover:text-indigo-500 transition-colors"
                    title="Edit Slug"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}
            </div>
          </div>
        </td>
        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            {/* Review Details Button */}
            <Link
              href={`/dashboard/users/${user.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 text-[11px] font-bold transition-all"
              title="Review User Details"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Details</span>
            </Link>

            {/* Toggle Status / Self Protection Button */}
            {isSelf ? (
              <span
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                title="Current Logged In Super Admin (Self)"
              >
                You (Active)
              </span>
            ) : canToggle ? (
              <ToggleStatusButton
                isActive={user.isActive}
                isSelf={isSelf}
                onClick={() => setShowConfirm(true)}
              />
            ) : user.isActive && loggedInRole === UserRole.ADMIN ? (
              <span
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                title="Only Super Admins can suspend active accounts"
              >
                Active
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
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">
                Confirm User Deletion
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete <strong>{fullName}</strong> ({user.email})? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditUserDetailsModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedUser) => {
            setCurrentFirstName(updatedUser.firstName);
            setCurrentLastName(updatedUser.lastName);
            setCurrentSlug(updatedUser.bookingSlug || "");
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}
