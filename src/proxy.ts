import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const secret = process.env.NEXT_AUTH_SECRET || process.env.AUTH_SECRET;
  const token = await getToken({ req, secret });

  const { pathname } = req.nextUrl;

  // 1. Client Protected Routes (/dashboard, /profile, /applications, /business-profile)
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

    // Strict Directive: Restrict Admins and Executives from Client User routes
    if (token.role === "ADMIN" || token.role === "EXECUTIVE") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 2. Admin Protected Routes (/admin)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN" && token.role !== "EXECUTIVE") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 3. Auth Routes (/login, /register)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    if (token.role === "ADMIN" || token.role === "EXECUTIVE") {
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
    "/applications/:path*",
    "/login",
    "/register",
  ],
};
