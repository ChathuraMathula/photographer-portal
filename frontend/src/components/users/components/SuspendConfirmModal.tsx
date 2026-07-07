import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

type Props = {
  open: boolean;
  isDeactivating: boolean;
  fullName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SuspendConfirmModal({ open, isDeactivating, fullName, loading, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
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
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
