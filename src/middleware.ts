import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only log for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`);
    const cookies = request.cookies.getAll();
    console.log("[Middleware] Cookies:", cookies.map(c => `${c.name}=${c.value}`).join("; "));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
