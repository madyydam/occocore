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

  // Check demo mode flag
  const isDemo =
    searchParams.get("mode") === "demo" ||
    searchParams.get("demo") === "true" ||
    request.cookies.get("occo_demo_mode")?.value === "true";

  // If entering demo mode on any route, set demo cookie
  if (searchParams.get("mode") === "demo" || searchParams.get("demo") === "true") {
    const response = NextResponse.next();
    response.cookies.set("occo_demo_mode", "true", { path: "/" });
    return response;
  }

  // If accessing /admin in real mode, check if session exists or redirect
  if (pathname.startsWith("/admin") && !isDemo) {
    // For local evaluation, allow admin access and let AdminContext handle real DB hydration
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
