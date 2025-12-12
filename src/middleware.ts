import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public routes - allow access without authentication
  // Define public routes - allow access without authentication
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/salons", "/about"];
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
  
  // Check for either token OR user cookie to avoid redirect loops
  // AuthContext sets 'user' cookie, while backend sets 'token' (which might be HttpOnly/hidden)
  const userCookie = request.cookies.get("user")?.value;
  
  // If user is authenticated and tries to access login/register, redirect to their dashboard
  if ((token || userCookie) && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        let dashboardPath = "/";
        switch (user.role) {
          case "admin":
            dashboardPath = "/admin/dashboard";
            break;
          case "owner":
            dashboardPath = "/owner/dashboard";
            break;
          case "customer":
            dashboardPath = "/customer/dashboard";
            break;
        }
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      } catch {
        // Invalid user cookie, allow access to login
      }
    }
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token && !userCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Role-based access control
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      
      // Admin routes - allow admin access
      if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/dashboard/admin")) {
        if (user.role === "admin") {
          return NextResponse.next();
        } else {
          // Redirect to user's own dashboard
          let dashboardPath = "/";
          switch (user.role) {
            case "owner":
              dashboardPath = "/owner/dashboard";
              break;
            case "customer":
              dashboardPath = "/customer/dashboard";
              break;
          }
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      }
      
      // Owner routes - allow owner access
      if (pathname.startsWith("/owner/dashboard") || pathname.startsWith("/dashboard/owner")) {
        if (user.role === "owner") {
          return NextResponse.next();
        } else {
          // Redirect to user's own dashboard
          let dashboardPath = "/";
          switch (user.role) {
            case "admin":
              dashboardPath = "/admin/dashboard";
              break;
            case "customer":
              dashboardPath = "/customer/dashboard";
              break;
          }
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      }
      
      // Customer routes - allow customer access
      if (pathname.startsWith("/customer/dashboard") || pathname.startsWith("/dashboard/customer")) {
        if (user.role === "customer") {
          return NextResponse.next();
        } else {
          // Redirect to user's own dashboard
          let dashboardPath = "/";
          switch (user.role) {
            case "admin":
              dashboardPath = "/admin/dashboard";
              break;
            case "owner":
              dashboardPath = "/owner/dashboard";
              break;
          }
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      }
      
      // For other protected routes, allow access if authenticated
      return NextResponse.next();
    } catch {
      // Invalid user cookie, but token exists - allow access (token validation happens on backend)
      return NextResponse.next();
    }
  }

  // Token exists but no user cookie - allow access (backend will validate token)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - should not be intercepted by middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
