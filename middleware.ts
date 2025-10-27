import { NextResponse, type NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  // return NextResponse.redirect(new URL("/dashboard/default", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/"]
};
