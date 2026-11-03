# API Specification, Server Actions & Data Contracts

This document specifies the communication protocols, Next.js Server Action signatures, REST API endpoints, and Zod validation schemas.

---

## 1. API Architecture & Standards

- **Server Actions**: Primary mutation pattern for form submissions, data grids, and user state transitions with end-to-end TypeScript inference.
- **REST / Webhook Endpoints**: Used for external integrations (Razorpay callbacks, SMS delivery receipts, WhatsApp webhooks) and offline synchronization.
- **Standard JSON Response Envelope**:
  ```typescript
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
      details?: Record<string, string[]>; // Zod field error map
    };
    meta?: {
      timestamp: string;
      tenant_id?: string;
    };
  }
  ```

---

## 2. Core Endpoint Specifications

### 2.0 3-Tier Authentication & PIN Management
- **`POST /api/auth/login`**
  - *Payload*:
    ```json
    {
      "email": "teacher@apexacademy.edu",
      "password": "StaffPassword#2026",
      "pin": "2468",
      "totp_code": "849201"
    }
    ```
  - *Validation*:
    - `email`: Valid RFC 5322 institutional email address.
    - `password`: Minimum 4 characters, verified against Argon2id hash.
    - `pin`: Strictly 4 numeric digits (`/^\d{4}$/`). Must match active user PIN.
    - `totp_code`: Required if role is `SUPER_ADMIN` (6 numeric digits).
  - *Response*:
    ```json
    {
      "success": true,
      "data": {
        "session_token": "jwt_token_string",
        "user": {
          "id": "usr-03",
          "name": "Vikram Rathore",
          "email": "teacher@apexacademy.edu",
          "role": "TEACHER",
          "allowed_modules": ["academics", "attendance", "exams", "communication"]
        }
      }
    }
    ```

- **`POST /api/admin/roles/pin-management`**
  - *Payload*:
    ```json
    {
      "user_id": "usr-03",
      "new_password": "NewStaffPass#2026",
      "new_pin": "9876",
      "status": "ACTIVE",
      "must_change_pin_on_login": false
    }
    ```
  - *Response*: `{ "success": true, "message": "User password and 4-digit PIN updated successfully." }`

- **`PATCH /api/admin/roles/:roleKey/modules`**
  - *Payload*:
    ```json
    {
      "allowed_modules": ["academics", "timetable", "attendance", "exams", "communication"]
    }
    ```
  - *Response*: `{ "success": true, "data": { "role": "TEACHER", "updated_modules": [...] } }`

### 2.1 Multi-Tenancy & Onboarding
- **`POST /api/tenant/onboarding`**
  - *Payload*:
    ```json
    {
      "name": "Apex International Academy",
      "slug": "apexacademy",
      "type": "K12_SCHOOL",
      "primary_color": "#1E3A8A",
      "font_family": "Plus Jakarta Sans",
      "enable_students": true,
      "enable_parents": true,
      "academic_year": { "title": "2026-2027", "start_month": 4 }
    }
    ```
  - *Response*: `{ "success": true, "data": { "tenant_id": "uuid", "portal_url": "https://apexacademy.edusaas.com" } }`

- **`POST /api/tenant/domain/verify`**
  - *Payload*: `{ "domain": "portal.apexacademy.edu" }`
  - *Response*: `{ "success": true, "data": { "is_verified": true, "ssl_status": "ACTIVE" } }`

---

### 2.2 Offline Synchronization Endpoint
- **`POST /api/sync/outbox`**
  - *Headers*: `x-tenant-id`, `x-idempotency-key`
  - *Payload*:
    ```json
    {
      "mutations": [
        {
          "id": "client-uuid-1",
          "action": "RECORD_ATTENDANCE",
          "timestamp": 1729864200000,
          "data": {
            "section_id": "uuid",
            "date": "2026-10-27",
            "records": [
              { "student_id": "uuid-1", "status": "PRESENT" },
              { "student_id": "uuid-2", "status": "ABSENT" }
            ]
          }
        }
      ]
    }
    ```
  - *Response*:
    ```json
    {
      "success": true,
      "data": {
        "processed_ids": ["client-uuid-1"],
        "failed_ids": []
      }
    }
    ```

---

### 2.3 Fee Collection & POS Cash Counter
- **`POST /api/fees/collect`**
  - *Payload*:
    ```json
    {
      "student_id": "uuid",
      "invoice_id": "uuid",
      "amount": 15000.00,
      "payment_method": "UPI_QR",
      "transaction_ref": "UPI/20261027/987123"
    }
    ```
  - *Response*:
    ```json
    {
      "success": true,
      "data": {
        "receipt_no": "AIA/RCP/2026/0491",
        "receipt_pdf_url": "https://s3.edusaas.com/apex/rcp_0491.pdf",
        "balance_remaining": 0.00
      }
    }
    ```

---

### 2.4 Examination Mark Entry
- **`POST /api/exams/:examId/marks`**
  - *Payload*:
    ```json
    {
      "subject_id": "uuid",
      "section_id": "uuid",
      "scores": [
        { "student_id": "uuid-1", "score": 92.5, "is_absent": false },
        { "student_id": "uuid-2", "score": 0.0, "is_absent": true }
      ]
    }
    ```
  - *Response*: `{ "success": true, "data": { "saved_records": 40, "class_average": 78.4 } }`
