import { UserRole } from "@/store/slices/authSlice";

// Exact-match public routes
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/portal/login",
  "/photography",
  "/photographers",
  "/studios",
  "/register/photographer",
  "/register/studio",
  "/about",
  "/test-accounts",
  "/sms-tester",
  "/forgot-password",
  "/reset-password",
  "/auth/customer-verify",
];

// Prefix-match public routes — /book/:slug, /photography, /photographers, /studios, /register, etc. are public
export const PUBLIC_PREFIXES = [
  "/book",
  "/photography",
  "/photographers",
  "/photographer",
  "/studios",
  "/portal",
  "/admin",
  "/register",
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
    "/photography",
    "/photographers",
  ],
  [UserRole.ADMIN]: [
    "/dashboard",
    "/dashboard/users",
    "/dashboard/reports",
    "/dashboard/profile",
    "/photography",
    "/photographers",
  ],
  [UserRole.STUDIO]: [
    "/dashboard",
    "/dashboard/reservations",
    "/dashboard/calendar",
    "/dashboard/photographers",
    "/dashboard/packages",
    "/dashboard/profile",
    "/dashboard/settings",
    "/photography",
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
    "/photography",
    "/photographers",
  ],
  [UserRole.CUSTOMER]: [
    "/customer",
    "/photography",
    "/photographers",
  ],
};

export const REDIRECTS = {
  unauthenticated: "/login",
  unauthorized: "/dashboard",
};
