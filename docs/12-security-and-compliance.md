# Security, Data Privacy & Regulatory Compliance (DPDPA 2023 & OWASP)

This document establishes the security architecture, Indian data privacy compliance protocols, encryption standards, and threat mitigation models.

---

## 1. Indian DPDPA 2023 (Digital Personal Data Protection Act) Compliance

As an education platform handling minor children's personal data, the ERP implements rigorous statutory safeguards:

1. **Parental Consent Enforcement**:
   - Accounts for students under 18 require documented parental/guardian authorization upon enrollment.
   - Purpose limitation: Student personal data is strictly isolated and never shared with third-party advertisers or commercial ad networks.
2. **Right to Correction & Erasure (Right to be Forgotten)**:
   - When a student graduates and all financial accounts are closed, parent/admin can trigger `Archive & Anonymize`.
   - Personal phone numbers, Aadhaar, and photos are purged, retaining only statutory academic records required by the education board.
3. **Data Localization**:
   - All tenant student databases and cloud document buckets reside in Indian data centers (e.g. AWS ap-south-1 Mumbai / Cloudflare India edge).

---

## 2. OWASP Top 10 Threat Mitigation Matrix

| Vulnerability | Platform Defense Mechanism |
| :--- | :--- |
| **A01: Broken Access Control** | Postgres Row-Level Security (RLS) + NextAuth RBAC session validation. Every query validates `tenant_id`. |
| **A02: Cryptographic Failures** | Argon2id for password hashing. AES-256 for document vault storage. TLS 1.3 in transit. |
| **A03: Injection (SQL / NoSQL)** | Prisma parameterized prepared queries. Zero raw string interpolation. |
| **A04: Insecure Design** | Strict rate-limiting on login/sync endpoints (Upstash Redis token bucket). Single active session option. |
| **A05: Security Misconfiguration** | Strict Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`. |
| **A06: Vulnerable Components** | Automated Dependabot audits; locked pnpm dependency trees; zero deprecated dependencies. |
| **A07: Identification & Auth Failures** | Mandatory 3-Tier Authentication (Email + Password + 4-Digit PIN) on all logins. TOTP 2FA for Super Admin. Brute-force lockout after 3 PIN failures. |
| **A08: Software & Data Integrity** | Cryptographic webhook signature verification (HMAC-SHA256). Idempotent outbox sync keys. |
| **A09: Logging & Monitoring** | Tamper-proof audit logs recording User ID, Action, Entity, IP address, and before/after JSON diffs. |
| **A10: Server-Side Request Forgery** | Restrict server-side fetch requests to verified payment and SMS gateway whitelist domains only. |

---

## 3. Cryptographic Audit Trail Architecture

All administrative mutations (e.g. altering exam marks, waiving fees, issuing TCs, deleting records) execute through an audit wrapper:

```typescript
// lib/audit.ts
export async function recordAuditLog(params: {
  tenantId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  req: Request;
}) {
  const ip = params.req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = params.req.headers.get('user-agent') || 'unknown';

  await prisma.auditLog.create({
    data: {
      tenant_id: params.tenantId,
      user_id: params.userId,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      ip_address: ip,
      user_agent: userAgent,
    },
  });
}
```

---

## 4. Institutional 4-Digit Security PIN & Role Governance Specification

### 4.1 Mandatory 3-Tier Login Policy
To safeguard institutional PII and protect students under DPDPA 2023, every user (Staff, Student, Parent, Super Admin) must authenticate with:
1. **Registered Institutional Email**
2. **Account Password**
3. **Mandatory 4-Digit Security PIN**

The portal dashboard is strictly inaccessible without verifying the 4-digit numeric PIN.

### 4.2 Administrator Credential Management Authority (`/admin/roles`)
The Institute Administrator retains complete authority over the user access perimeter:
- **Role Permissions & Module Access**: Grant or revoke access to any of the 11 system modules (Admissions, Academics, Timetable, Attendance, Fees, Exams, Transport, Hostel, Library, Communication, Reports) on a per-role basis.
- **Dynamic Role Creation**: Register new custom roles (e.g. Lab Incharge, Dean of Research) that inherit modular permissions immediately.
- **PIN & Password Administration**: Administrators can set or reset passwords and 4-digit PINs for any user in the directory, or enforce a mandatory reset on next login (`mustChangePinOnLogin`).
- **Account Lockout Controls**: Automatic locking after 3 consecutive failed PIN attempts to eliminate brute-force attack vectors.

