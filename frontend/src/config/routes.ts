import { UserRole } from "@/store/slices/authSlice";

// Exact-match public routes
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/photographer/login",
  "/admin/login",
  "/photographers",
  "/about",
  "/test-accounts",
  "/forgot-password",
  "/reset-password",
  "/auth/customer-verify",
];

// Prefix-match public routes — /book/:slug, /photographers, etc. are public
export const PUBLIC_PREFIXES = [
  "/book",
  "/photographers",
  "/photographer",
  "/admin",
  "/leaflet",
  "/tiles",
  "/maps",
  "/auth",
  "/customer",
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/photographers",
    "/dashboard/settings",
    "/dashboard/audit-logs",
    "/dashboard/reports",
    "/photographers",
  ],
  [UserRole.ADMIN]: [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/reports",
    "/dashboard/profile",
    "/photographers",
  ],
  [UserRole.PHOTOGRAPHER]: [
    "/dashboard",
    "/dashboard/reservations",
    "/dashboard/calendar",
    "/dashboard/packages",
    "/dashboard/profile",
    "/dashboard/settings",
    "/dashboard/invoices",
    "/photographers",
  ],
  [UserRole.CUSTOMER]: [
    "/customer",
    "/photographers",
  ],
};

export const REDIRECTS = {
  unauthenticated: "/login",
  unauthorized: "/dashboard",
};
