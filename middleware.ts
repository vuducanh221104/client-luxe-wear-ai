import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const isAuthenticated = Boolean(cookies.get("auth")?.value);
  const pathname = nextUrl.pathname;

  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname.startsWith("/auth/");

  // Redirect unauthenticated user away from dashboard về trang chủ
  if (isDashboard && !isAuthenticated) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated user away from auth pages
  if (isAuthPage && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"]
};
