import { useState } from "react";
import { type UserAccount } from "@/types";
import { UserRole } from "@/store/slices/authSlice";
import { Edit2 } from "lucide-react";
import { EditUserDetailsModal } from "@/components/modals/EditUserDetailsModal";
import { RoleBadge } from "./components/RoleBadge";
import { ToggleStatusButton } from "./components/ToggleStatusButton";
import { SuspendConfirmModal } from "./components/SuspendConfirmModal";

type Props = { user: UserAccount; onToggleActive: (id: string) => void; loggedInUserId: string; loggedInRole: string; };

export function UserTableRow({ user, onToggleActive, loggedInUserId, loggedInRole }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentFirstName, setCurrentFirstName] = useState(user.firstName);
  const [currentLastName, setCurrentLastName] = useState(user.lastName);
  const [currentSlug, setCurrentSlug] = useState(user.profile?.bookingSlug || "");

  const isDeactivating = user.isActive;
  const fullName = `${user.firstName} ${user.lastName}`;
  const isSelf = user.id === loggedInUserId;

  const handleConfirm = async () => { setToggling(true); try { await onToggleActive(user.id); } finally { setToggling(false); setShowConfirm(false); } };

  return (
    <>
      <tr className="border-b border-zinc-100 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/20">
        <td className="p-4 text-body-small-s"><span className="font-semibold text-zinc-900 dark:text-white">{currentFirstName} {currentLastName}</span></td>
        <td className="p-4 text-body-small-s text-zinc-600 dark:text-zinc-350">{user.email}</td>
        <td className="p-4"><RoleBadge role={user.role} /></td>
        <td className="p-4 text-body-small-s text-zinc-500">{user.phone || "-"}</td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            {currentSlug ? (
              <a href={`/book/${currentSlug}`} target="_blank" rel="noreferrer" className="text-body-caption text-primary-light hover:text-primary-dark hover:underline dark:text-indigo-400 dark:hover:text-indigo-305 transition-colors font-semibold">slug: {currentSlug}</a>
            ) : (<span className="text-body-caption text-zinc-400">-</span>)}
            {loggedInRole === UserRole.SUPER_ADMIN && user.role === UserRole.PHOTOGRAPHER && (
              <button onClick={() => setShowEditModal(true)} className="p-1 text-zinc-400 hover:text-indigo-500 transition-colors" title="Edit Slug"><Edit2 className="h-3.5 w-3.5" /></button>
            )}
          </div>
        </td>
        <td className="p-4 text-right">
          <ToggleStatusButton isActive={user.isActive} isSelf={isSelf} onClick={() => !isSelf && setShowConfirm(true)} />
        </td>
      </tr>

      <SuspendConfirmModal open={showConfirm} isDeactivating={isDeactivating} fullName={fullName} loading={toggling} onConfirm={handleConfirm} onCancel={() => setShowConfirm(false)} />

      {showEditModal && (
        <EditUserDetailsModal user={user} onClose={() => setShowEditModal(false)} onSuccess={(updatedUser) => { setCurrentFirstName(updatedUser.firstName); setCurrentLastName(updatedUser.lastName); setCurrentSlug(updatedUser.bookingSlug || ""); setShowEditModal(false); }} />
      )}
    </>
  );
}
