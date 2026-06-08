import { UserRole } from "@/store/slices/authSlice";

// Exact-match public routes
export const PUBLIC_ROUTES = ["/", "/login", "/about"];

// Prefix-match public routes — /book/:slug and /book/track/:token are always public
export const PUBLIC_PREFIXES = ["/book"];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ["/dashboard", "/users", "/photographers", "/settings"],
  [UserRole.PHOTOGRAPHER]: ["/dashboard", "/reservations", "/profile"],
};

export const REDIRECTS = {
  unauthenticated: "/login",
  unauthorized: "/dashboard",
};
