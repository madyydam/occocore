import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Static assets and internal next paths bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // 1. SUPER ADMIN ROUTE GUARD
  if (pathname.startsWith("/super-admin")) {
    const isLoginPage = pathname === "/super-admin/login";
    const superAdminToken = request.cookies.get("core_superadmin_token")?.value;

    if (!superAdminToken && !isLoginPage) {
      const loginUrl = new URL("/super-admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (superAdminToken && isLoginPage) {
      const dashboardUrl = new URL("/super-admin", request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  // 2. DEMO MODE ISOLATION
  // Explicit real mode query param or accessing clean onboarding: clear demo cookie
  if (
    searchParams.get("mode") === "real" ||
    searchParams.get("real") === "true" ||
    (pathname === "/onboarding" && searchParams.get("mode") !== "demo")
  ) {
    const response = NextResponse.next();
    response.cookies.delete("core_demo_mode");
    response.cookies.delete("occo_demo_mode");
    return response;
  }

  // Check demo mode flag
  const isDemo =
    searchParams.get("mode") === "demo" ||
    searchParams.get("demo") === "true" ||
    request.cookies.get("core_demo_mode")?.value === "true" ||
    request.cookies.get("occo_demo_mode")?.value === "true";

  // If entering demo mode on any route, set demo cookie
  if (searchParams.get("mode") === "demo" || searchParams.get("demo") === "true") {
    const response = NextResponse.next();
    response.cookies.set("core_demo_mode", "true", { path: "/" });
    return response;
  }

  // If accessing /admin or /erp in real mode
  if ((pathname.startsWith("/admin") || pathname.startsWith("/erp")) && !isDemo) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
