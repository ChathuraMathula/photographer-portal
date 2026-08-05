import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PUBLIC_ROUTES,
  PUBLIC_PREFIXES,
  ROLE_PERMISSIONS,
  REDIRECTS,
} from "@/config/routes";
import { decodeJwtPayload } from "@/lib/jwt";
import { UserRole } from "@/store/slices/authSlice";

const AUTH_PAGES = ["/login", "/portal/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    if (token && AUTH_PAGES.includes(pathname)) {
      const decodedToken = decodeJwtPayload(token);
      const isExpired = decodedToken
        ? decodedToken.exp * 1000 < Date.now()
        : true;
      if (!decodedToken || isExpired) {
        const response = NextResponse.next();
        response.cookies.delete("access_token");
        return response;
      }

      const userRole = decodedToken.role as UserRole;
      const targetDashboard =
        userRole === UserRole.CUSTOMER ? "/customer/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(
      new URL(REDIRECTS.unauthenticated, request.url),
    );
  }

  const decodedToken = decodeJwtPayload(token);
  const isExpired = decodedToken ? decodedToken.exp * 1000 < Date.now() : true;

  if (!decodedToken || isExpired) {
    const response = NextResponse.redirect(
      new URL(REDIRECTS.unauthenticated, request.url),
    );
    response.cookies.delete("access_token");
    return response;
  }

  const userRole = decodedToken.role as UserRole;
  const allowedPaths = ROLE_PERMISSIONS[userRole] || [];

  const isAuthorized = allowedPaths.some((allowedPath) =>
    pathname.startsWith(allowedPath),
  );

  if (!isAuthorized) {
    console.warn(
      `Unauthorized: Role ${userRole} attempted to access ${pathname}`,
    );
    const targetRedirect =
      userRole === UserRole.CUSTOMER ? "/customer/dashboard" : REDIRECTS.unauthorized;
    return NextResponse.redirect(new URL(targetRedirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|leaflet|tiles|maps|favicon.ico).*)"],
};
