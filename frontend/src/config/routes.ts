import { UserRole } from "@/store/slices/authSlice";

export const PUBLIC_ROUTES = ['/', '/login', '/about'];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    '/dashboard', 
    '/users',       
    '/settings',  
  ],
  [UserRole.ADMIN]: [
    '/dashboard', 
    '/photographers', 
    '/settings',     
  ],
  [UserRole.PHOTOGRAPHER]: [
    '/dashboard', 
    '/reservations',
    '/profile',
  ],
};

// 3. Fallback redirects
export const REDIRECTS = {
  unauthenticated: '/login',
  unauthorized: '/dashboard', 
};