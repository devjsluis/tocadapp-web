import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("token")?.value;

  const refreshToken = request.cookies.get("refreshToken")?.value;

  const hasSession = Boolean(accessToken || refreshToken);

  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email" ||
    pathname === "/verify-email-required" ||
    pathname === "/reset-password";

  if (!isPublicPath && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    isPublicPath &&
    hasSession &&
    pathname !== "/" &&
    pathname !== "/reset-password" &&
    pathname !== "/verify-email"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-email-required",
  ],
};
