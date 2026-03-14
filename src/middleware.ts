import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { parseSessionToken } from "@/server/auth/session";

const PUBLIC_PATHS = ["/login", "/register", "/join"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");

  // Validate the session token if present
  const session = sessionCookie?.value
    ? await parseSessionToken(sessionCookie.value, env.SESSION_SECRET)
    : null;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Redirect authenticated users away from auth pages
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Clear invalid cookie to prevent redirect loops
    if (sessionCookie?.value && !session) {
      const response = NextResponse.next();
      response.cookies.delete("session");
      return response;
    }
    return NextResponse.next();
  }

  // Protect all other matched routes
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Clear invalid cookie to prevent redirect loops
    if (sessionCookie?.value) {
      response.cookies.delete("session");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/insights/:path*",
    "/login",
    "/register",
    "/join",
  ],
};
