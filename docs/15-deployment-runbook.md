# Production Deployment Runbook, Infrastructure & Disaster Recovery

This document outlines deployment pipelines, containerization standards, environment configurations, and disaster recovery procedures.

---

## 1. Production Infrastructure Topology

- **Edge Proxy**: Cloudflare (SSL termination, DDoS protection, edge caching, CNAME wildcard routing).
- **Application Runtime**: Next.js 15 standalone Node.js container hosted on AWS ECS (Fargate) / Vercel Enterprise / Fly.io.
- **Database**: Managed PostgreSQL 16+ (AWS RDS Aurora / Supabase Enterprise) with PgBouncer connection pooling.
- **Cache & Queue**: Managed Redis 7+ (AWS ElastiCache / Upstash).
- **Object Storage**: S3-compatible cloud storage (Cloudflare R2 / AWS S3 Mumbai `ap-south-1`).

---

## 2. Environment Variables Checklist

```env
# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_DOMAIN="edusaas.com"
NEXT_PUBLIC_APP_NAME="EduERP OS"

# Database
DATABASE_URL="postgresql://user:password@pgbouncer.internal:6432/eduerp?pgbouncer=true"
DIRECT_URL="postgresql://user:password@db.internal:5432/eduerp"

# Redis
REDIS_URL="redis://default:token@redis.internal:6379"

# NextAuth
NEXTAUTH_URL="https://app.edusaas.com"
NEXTAUTH_SECRET="super-cryptographic-random-secret-key-32-chars"

# S3 Storage (Cloudflare R2)
R2_ACCOUNT_ID="r2_account_id"
R2_ACCESS_KEY_ID="r2_access_key"
R2_SECRET_ACCESS_KEY="r2_secret_key"
R2_BUCKET_NAME="eduerp-production-assets"
NEXT_PUBLIC_CDN_URL="https://cdn.edusaas.com"

# Payment Gateways (India)
RAZORPAY_KEY_ID="rzp_live_xxx"
RAZORPAY_KEY_SECRET="rzp_secret_xxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxx"

CASHFREE_APP_ID="cf_live_xxx"
CASHFREE_SECRET_KEY="cf_secret_xxx"

# Omnichannel Communications
WHATSAPP_PHONE_NUMBER_ID="meta_phone_id"
WHATSAPP_ACCESS_TOKEN="meta_access_token"
DLT_SMS_API_KEY="msg91_dlt_key"
DLT_PE_ID="1201159xxxxxxxxx"
```

---

## 3. Zero-Downtime Deployment & Database Migration Procedure

1. **Pre-Deployment**:
   - Run automated test suite: `pnpm test` and `pnpm test:e2e`.
   - Run typecheck and lint: `pnpm tsc --noEmit` and `pnpm lint`.
2. **Database Migration Step**:
   - Run non-destructive migrations: `prisma migrate deploy`.
   - All migrations must be backward-compatible (expand-and-contract pattern: add columns as nullable first, never rename or drop columns in active use).
3. **Application Container Rolling Update**:
   - Deploy new container image with health check probe at `/api/health`.
   - Traffic transitions only when container returns `200 OK`.
4. **Post-Deployment Smoke Test**:
   - Automated curl to `https://app.edusaas.com/api/health`.
   - Verify Redis connectivity, database query latency, and edge host resolution.

---

## 4. Disaster Recovery & Backup Runbook

- **Automated Hourly Snapshots**: AWS RDS Aurora automated snapshots retained for 35 days.
- **Off-Site Logical Backup**: Daily `pg_dump` compressed with AES-256 and uploaded to an independent S3 bucket in a secondary cloud region.
- **Recovery Time Objective (RTO)**: < 15 minutes.
- **Recovery Point Objective (RPO)**: < 1 hour.
