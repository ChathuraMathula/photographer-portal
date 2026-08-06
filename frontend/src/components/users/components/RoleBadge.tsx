import { Shield, Camera, Building2, User } from "lucide-react";
import { UserRole } from "@/store/slices/authSlice";

export function RoleBadge({ role }: { role: string | UserRole }) {
  if (role === UserRole.SUPER_ADMIN || role === "SUPER_ADMIN")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
        <Shield className="h-3 w-3" /> Super Admin
      </span>
    );

  if (role === UserRole.ADMIN || role === "ADMIN")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
        <Shield className="h-3 w-3" /> Admin
      </span>
    );

  if (role === UserRole.STUDIO || role === "STUDIO")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
        <Building2 className="h-3 w-3" /> Studio
      </span>
    );

  if (role === "STUDIO_PHOTOGRAPHER" || role === UserRole.STUDIO_PHOTOGRAPHER)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40">
        <Camera className="h-3 w-3" /> Studio Photographer
      </span>
    );

  if (role === "STUDIO_STAFF" || role === UserRole.STUDIO_STAFF)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        <User className="h-3 w-3" /> Studio Staff
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
      <Camera className="h-3 w-3" /> Photographer
    </span>
  );
}
