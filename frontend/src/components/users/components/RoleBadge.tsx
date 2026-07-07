import { Shield, Camera } from "lucide-react";
import { UserRole } from "@/store/slices/authSlice";

export function RoleBadge({ role }: { role: UserRole }) {
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
