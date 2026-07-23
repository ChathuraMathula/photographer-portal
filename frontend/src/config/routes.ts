import { UserRole } from "@/store/slices/authSlice";

// Exact-match public routes
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/about",
  "/test-accounts",
  "/forgot-password",
  "/reset-password",
];

// Prefix-match public routes — /book/:slug and /book/track/:token are always public
export const PUBLIC_PREFIXES = ["/book", "/leaflet", "/tiles", "/maps"];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/photographers",
    "/dashboard/settings",
    "/dashboard/audit-logs",
    "/dashboard/reports",
  ],
  [UserRole.ADMIN]: [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/reports",
    "/dashboard/profile",
  ],
  [UserRole.PHOTOGRAPHER]: [
    "/dashboard",
    "/dashboard/reservations",
    "/dashboard/calendar",
    "/dashboard/packages",
    "/dashboard/profile",
    "/dashboard/settings",
    "/dashboard/invoices",
  ],
};

export const REDIRECTS = {
  unauthenticated: "/login",
  unauthorized: "/dashboard",
};
