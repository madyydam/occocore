# Technical & Operational Risk Register

This document tracks identified architectural, regulatory, and technical risks, alongside their severity ratings and mitigation protocols.

---

## Risk Assessment Matrix

| Risk ID | Description | Impact | Likelihood | Mitigation Strategy | Monitoring & Detection |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **R01** | **Cross-Tenant Data Leakage** | Critical | Low | PostgreSQL Row-Level Security (RLS) policies at the kernel level + Prisma scoped client extension. | Automated CI suite runs cross-tenant query assertion tests on every pull request. |
| **R02** | **Offline Sync Conflicts & Clock Skew** | High | Medium | Server-authoritative timestamps, idempotent client UUID keys, and field-level Last-Write-Wins (LWW) conflict logic. | Sync endpoint logs conflict overrides; alerts admin if failure rate > 1%. |
| **R03** | **Custom Domain SSL Rate Limiting** | Medium | Medium | Cloudflare for Platforms / CNAME proxy with wildcard edge SSL, eliminating Let's Encrypt certificate rate limits. | SSL health status worker monitors pending domains every 15 minutes. |
| **R04** | **PDF Generation Memory Exhaustion** | High | Medium | Bulk report cards compiled asynchronously in background worker queues (BullMQ) streaming directly to S3; client receives async download URL. | Worker container memory usage metric alarm set at 80% threshold. |
| **R05** | **TRAI DLT / WhatsApp Template Rejections** | Medium | High | Maintain standard pre-approved template catalog for essential educational notifications (attendance, marks, receipts). | Automated fallback to secondary DLT SMS gateway if WhatsApp fails. |
| **R06** | **Payment Webhook Double-Processing** | High | Low | Database-level idempotency locks and atomic transactions ensuring invoices can only transition to `PAID` once. | Webhook processing logs track duplicate event ID occurrences. |
| **R07** | **Large CSV Import Browser Freeze** | Medium | Medium | Chunked streaming parser (`PapaParse` in Web Worker) processing 50 rows per batch with visual progress indicator. | Client UI benchmarks ensure 5,000-row CSV import does not drop frame rates below 60fps. |
