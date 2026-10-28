import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const secret = process.env.NEXT_AUTH_SECRET || process.env.AUTH_SECRET;
  const token = await getToken({ req, secret });

  const { pathname } = req.nextUrl;

  // 1. Admin API Routes (/api/admin/*) - Return JSON 401/403 for API consumers
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      console.warn(`[Security Audit] Unauthorized attempt to access admin API: ${pathname}`);
      return NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    if (token.role !== "ADMIN") {
      console.warn(`[Security Audit] Forbidden admin access attempt by user ${(token as any).id || "unknown"} (role: ${token.role}) on: ${pathname}`);
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 1b. Protected API Routes requiring authentication
  const protectedApiRoutes = ["/api/documents", "/api/compliance-schedules"];
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedApi && !token) {
    console.warn(`[Security Audit] Unauthorized attempt to access protected API: ${pathname}`);
    return NextResponse.json(
      { error: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  // 2. Client Protected Routes (/dashboard, /profile, /applications, /business-profile)
  const protectedClientRoutes = [
    "/dashboard",
    "/profile",
    "/applications",
    "/business-profile",
  ];
  const isClientRoute = protectedClientRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isClientRoute) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict Directive: Restrict Admins from Client User routes
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 3. Admin Protected Pages (/admin)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 4. Auth Routes (/login, /register)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/business-profile", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/business-profile/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/documents/:path*",
    "/api/compliance-schedules/:path*",
    "/applications/:path*",
    "/login",
    "/register",
  ],
};
