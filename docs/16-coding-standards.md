# Engineering Standards, Code Quality Guidelines & Conventions

This document establishes the non-negotiable coding standards, TypeScript strictness guidelines, and development conventions for this repository.

---

## 1. TypeScript Strictness & Type Safety

- **Zero `any` Policy**: The use of `any` is strictly prohibited. Use `unknown` with runtime type narrowing or generic type parameters.
- **Strict Compiler Settings**:
  - `"strict": true`
  - `"noImplicitAny": true`
  - `"strictNullChecks": true`
  - `"noUnusedLocals": true`
  - `"noUnusedParameters": true`
- **Exhaustive Pattern Matching**: Switch statements over union types must handle all cases or use an `assertNever(x: never)` guard.

---

## 2. Server-Side Validation on Every Input (Zod)

Every Server Action, API endpoint, and mutation must validate its input through a dedicated Zod schema before accessing database layers:

```typescript
// schemas/student.ts
import { z } from 'zod';

export const createStudentSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  admission_no: z.string().min(1, 'Admission number is required'),
  section_id: z.string().uuid('Invalid section selection'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid birth date'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  emergency_phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
```

---

## 3. Component Architecture & State Guidelines

1. **Server Components by Default**:
   - Fetch data directly in React Server Components (RSC) to maximize performance and eliminate client-side waterfall loading spinners.
2. **Client Components Only When Interactive**:
   - Mark with `'use client'` only when utilizing browser APIs, React state/hooks (`useState`, `useEffect`), or event listeners.
3. **Optimistic Updates**:
   - Mutations in client components must utilize React's `useOptimistic()` or TanStack Query mutation caches to guarantee instant UI feedback.

---

## 4. Git Commit Standards (Conventional Commits)

All commits must follow the Conventional Commits specification:
- `feat(module): description` (e.g. `feat(fees): add dynamic upi qr generation to invoices`)
- `fix(module): description` (e.g. `fix(attendance): resolve race condition in offline outbox sync`)
- `test(module): description` (e.g. `test(tenant): add rls cross-tenant isolation assertion`)
- `docs(module): description` (e.g. `docs(architecture): update host-based routing diagram`)
