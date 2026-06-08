import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PUBLIC_ROUTES, PUBLIC_PREFIXES, ROLE_PERMISSIONS, REDIRECTS } from '@/config/routes';
import { decodeJwtPayload } from '@/lib/jwt';
import { UserRole } from '@/store/slices/authSlice';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(REDIRECTS.unauthenticated, request.url));
  }

  const decodedToken = decodeJwtPayload(token);
  if (!decodedToken) {
    request.cookies.delete('access_token');
    return NextResponse.redirect(new URL(REDIRECTS.unauthenticated, request.url));
  }

  const userRole = decodedToken.role as UserRole;

  const allowedPaths = ROLE_PERMISSIONS[userRole] || [];

  const isAuthorized = allowedPaths.some((allowedPath) => pathname.startsWith(allowedPath));

  if (!isAuthorized) {
    console.warn(`Unauthorized: Role ${userRole} attempted to access ${pathname}`);
    return NextResponse.redirect(new URL(REDIRECTS.unauthorized, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};