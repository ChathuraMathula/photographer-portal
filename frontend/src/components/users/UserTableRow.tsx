import { useState } from "react";
import { type UserAccount } from "@/types";
import { UserRole } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Shield, Camera, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { EditUserDetailsModal } from "./EditUserDetailsModal";

type Props = {
  user: UserAccount;
  onToggleActive: (id: string) => void;
  loggedInUserId: string;
  loggedInRole: string;
};

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.SUPER_ADMIN)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-body-caption font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
        <Shield className="h-3 w-3" /> Super Admin
      </span>
    );
  if (role === UserRole.ADMIN)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-body-caption font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
        <Shield className="h-3 w-3" /> Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-body-caption font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
      <Camera className="h-3 w-3" /> Photographer
    </span>
  );
}

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

  const handleConfirm = async () => {
    setToggling(true);
    try {
      await onToggleActive(user.id);
    } finally {
      setToggling(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <tr className="border-b border-zinc-100 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/20">
        <td className="p-4 text-body-small-s">
          <span className="font-semibold text-zinc-900 dark:text-white">
            {currentFirstName} {currentLastName}
          </span>
        </td>
        <td className="p-4 text-body-small-s text-zinc-600 dark:text-zinc-350">{user.email}</td>
        <td className="p-4">
          <RoleBadge role={user.role} />
        </td>
        <td className="p-4 text-body-small-s text-zinc-500">{user.phone || "-"}</td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            {currentSlug ? (
              <a
                href={`/book/${currentSlug}`}
                target="_blank"
                rel="noreferrer"
                className="text-body-caption text-primary-light hover:text-primary-dark hover:underline dark:text-indigo-400 dark:hover:text-indigo-305 transition-colors font-semibold"
              >
                slug: {currentSlug}
              </a>
            ) : (
              <span className="text-body-caption text-zinc-400">-</span>
            )}
            
            {loggedInRole === UserRole.SUPER_ADMIN && user.role === UserRole.PHOTOGRAPHER && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1 text-zinc-400 hover:text-indigo-500 transition-colors"
                title="Edit Slug"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </td>
        <td className="p-4 text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => !isSelf && setShowConfirm(true)}
            disabled={isSelf}
            className={`btn btn-secondary h-8 px-3 py-0 min-w-0 md:min-w-0 text-body-caption shadow-none gap-1 border ${
              isSelf
                ? "opacity-50 cursor-not-allowed text-zinc-400 bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                : user.isActive
                ? "text-emerald-700 border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-950/30 dark:bg-emerald-950/10"
                : "text-zinc-555 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700"
            }`}
          >
            {user.isActive ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Active
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 shrink-0" /> Suspended
              </>
            )}
          </Button>
        </td>
      </tr>

      {showConfirm && (
        <ConfirmationModal
          title={isDeactivating ? `Suspend ${fullName}?` : `Reactivate ${fullName}?`}
          description={
            isDeactivating
              ? `Suspending ${fullName} will immediately revoke their portal access and log them out of all active sessions. Are you sure you want to proceed?`
              : `Reactivating ${fullName} will restore their access to the portal. They will be able to log in again immediately.`
          }
          confirmLabel={isDeactivating ? "Yes, Suspend Account" : "Yes, Reactivate"}
          cancelLabel="Cancel"
          variant={isDeactivating ? "danger" : "default"}
          loading={toggling}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
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
