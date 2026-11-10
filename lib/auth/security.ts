import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET_KEY =
  process.env.NEXTAUTH_SECRET ||
  "core-platform-superadmin-master-key-2026-9f8a2bc810e9482";

export interface SuperAdminSessionPayload {
  userId: string;
  email: string;
  role: "SUPER_ADMIN";
  fullName: string;
  exp: number;
}

export interface TenantAdminSessionPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  exp: number;
}

/**
 * Creates an HMAC-SHA256 signed tamper-proof token
 */
export function signToken(payload: Record<string, unknown>, expiresInSeconds = 86400): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${header}.${payloadB64}`)
    .digest("base64url");
  return `${header}.${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 token and returns payload if valid
 */
export function verifyToken<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${header}.${payloadB64}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as Record<string, unknown>;
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload as T;
  } catch {
    return null;
  }
}

/**
 * Super Admin Cookie Session Name
 */
export const SUPERADMIN_COOKIE_NAME = "core_superadmin_token";
export const TENANT_COOKIE_NAME = "core_tenant_session";

/**
 * Get current Super Admin session on the server
 */
export async function getSuperAdminSession(): Promise<SuperAdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPERADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken<SuperAdminSessionPayload>(token);
}

/**
 * Set Super Admin session cookie
 */
export async function setSuperAdminSessionCookie(payload: Omit<SuperAdminSessionPayload, "exp">) {
  const token = signToken(payload, 86400); // 24 hours
  const cookieStore = await cookies();
  cookieStore.set(SUPERADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
}

/**
 * Destroy Super Admin session cookie (True Logout)
 */
export async function clearSuperAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPERADMIN_COOKIE_NAME);
}

/**
 * Hash a password using SHA-256 with salt
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SECRET_KEY).digest("hex");
}

/**
 * Verify password against plain or hashed password
 */
export function verifyPassword(inputPassword: string, storedHash: string): boolean {
  // Support both plain string match during bootstrap and sha256
  if (inputPassword === storedHash) return true;
  return hashPassword(inputPassword) === storedHash;
}

