import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/salons"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Role-based access
  const userCookie = request.cookies.get("user")?.value;
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      
      // Admin routes
      if (pathname.startsWith("/dashboard/admin") && user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Owner routes
      if (pathname.startsWith("/dashboard/owner") && user.role !== "owner") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Customer routes
      if (pathname.startsWith("/dashboard/customer") && user.role !== "customer") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Invalid user cookie, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/auth/:path*",
    "/salons/:path*",
  ],
};
