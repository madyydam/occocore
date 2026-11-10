import { NextResponse } from "next/server";
import { clearSuperAdminSessionCookie } from "@/lib/auth/security";

export async function POST(request: Request) {
  await clearSuperAdminSessionCookie();
  const url = new URL("/super-admin/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  await clearSuperAdminSessionCookie();
  const url = new URL("/super-admin/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

