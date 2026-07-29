# Repository Audit Report

## Summary
- **Total issues found:** 10
- **Critical:** 1 | **High:** 3 | **Medium:** 4 | **Low:** 2
- **Overview:** The platform demonstrates strong architectural foundations with dynamic Zod validation, rate limiting, and magic-byte file upload safety. However, urgent risks exist around unbounded database queries on application lists, client-side fee calculation reliance during payment creation, and in-memory rate limiting state non-persistence across distributed serverless environments.

---

## Security Issues

### [SEC-1] In-Memory Rate Limiter Non-Persistent Across Distributed Serverless Instances
- **Severity:** High
- **Location(s):** `src/lib/rate-limit.ts` (Lines 1-45), `src/middleware.ts`
- **Description:** Rate limiting is managed using a local JavaScript `Map<string, RateLimitRecord>`. In serverless or multi-container deployments (such as Vercel or multi-node Kubernetes), each lambda function/node maintains isolated memory state. An attacker can bypass rate limits by distributing requests across edge instances.
- **Suggested Fix:** Replace the local in-memory `Map` with an atomic distributed store like Redis / Upstash (`@upstash/ratelimit`) to enforce rate limits globally across all serverless edge nodes.

```typescript
// Recommended Fix Concept using Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(180, "1 m"),
});
```

---

### [SEC-2] Client-Side Fee & Amount Input Reliance on Payment Order Creation
- **Severity:** High
- **Location(s):** `src/app/api/create-order/route.ts` (Lines 35-45), `src/features/services/detail/MultiServiceCheckoutModal.tsx`
- **Description:** `POST /api/create-order` accepts the payment `amount` directly from the client request body (`amountInPaise`). If a malicious client modifies the request payload to send a lower fee amount (e.g. ₹1 instead of ₹5,000), Razorpay creates an order for ₹1.
- **Suggested Fix:** Re-calculate the expected fee on the server side inside `POST /api/create-order` by fetching service prices directly from the database using `serviceSlug` or `applicationIds`, and ignore client-supplied `amount` values.

```typescript
// Recommended Fix Concept inside create-order/route.ts
const dbService = await prisma.service.findUnique({ where: { slug: serviceSlug } });
const verifiedAmountInPaise = Math.round(dbService.price * 100);
```

---

### [SEC-3] Hardcoded Master Admin Seeding Credentials in Codebase
- **Severity:** Medium
- **Location(s):** `prisma/seed.ts` (Lines 15-25)
- **Description:** Master admin seeding script contains hardcoded email `admin@firstlease.com` and initial password hash/plaintext. If executed in production environments without changing default seeds, default credentials may expose administrative access.
- **Suggested Fix:** Read seed credentials from environment variables (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) with a runtime check requiring password change on first login.

---

## Performance Issues

### [PERF-1] Unbounded Database Query on Application Fetch Handler
- **Severity:** Critical
- **Location(s):** `src/app/api/applications/route.ts` (Lines 18-28)
- **Description:** `prisma.application.findMany()` fetches all application records ordered by `createdAt: "desc"` without `take` or `skip` pagination limits. As application numbers grow (e.g., 10,000+ cases), fetching full records with relations will cause excessive RAM usage and slow database query times.
- **Suggested Fix:** Implement query pagination (`page`, `limit`) and field selection projections (`select`).

```typescript
// Recommended Fix Concept
const page = parseInt(searchParams.get("page") || "1", 10);
const limit = parseInt(searchParams.get("limit") || "20", 10);

const applications = await prisma.application.findMany({
  take: limit,
  skip: (page - 1) * limit,
  orderBy: { createdAt: "desc" },
  include: { documents: true, assignedExecutive: true },
});
```

---

### [PERF-2] Full Relational Graph Queries Without Column Selection Projections
- **Severity:** Medium
- **Location(s):** `src/app/api/services/route.ts` (Lines 10-25), `src/app/(website)/services/page.tsx`
- **Description:** `prisma.service.findMany({ include: { details: true } })` fetches full table columns including large text fields.
- **Suggested Fix:** Specify explicit `select` fields in Prisma queries to retrieve only required fields for list views.

---

## Bugs & Correctness Issues

### [BUG-1] Concurrency Race Condition in Auto-Provisioning Executive Users
- **Severity:** High
- **Location(s):** `src/app/api/applications/[id]/route.ts` (Lines 80-105)
- **Description:** In `PATCH /api/applications/[id]`, if an assigned executive is not found by name, code executes `prisma.user.create()` using `id: exec_${slugName}_${Date.now()}` and email `${slugName}@firstlease.com`. If two admin requests update cases with the same new executive name simultaneously, duplicate email creation will throw a MySQL unique constraint violation (`P2002`).
- **Suggested Fix:** Use `prisma.user.upsert()` with unique email criteria or atomic transaction locks.

```typescript
// Recommended Fix Concept
execUser = await prisma.user.upsert({
  where: { email: `${slugName}@firstlease.com` },
  update: {},
  create: {
    id: `exec_${slugName}_${Date.now()}`,
    name: cleanName,
    email: `${slugName}@firstlease.com`,
    role: "EXECUTIVE",
  },
});
```

---

### [BUG-2] Missing Error Boundary for Asynchronous Polling Fetch Failures
- **Severity:** Medium
- **Location(s):** `src/app/(website)/admin/page.tsx` (Lines 45-65)
- **Description:** The admin portal polls `GET /api/applications` on an interval. If the server returns a non-200 HTTP error (e.g. 500 Internal Server Error during DB maintenance), `res.json()` fails or UI state resets abruptly without preserving current filter tab selections.
- **Suggested Fix:** Add error state boundaries and retain existing case list on transient poll failures.

---

## Code Quality Notes

### [QUAL-1] Dual Data Source Abstraction (Prisma DB vs Fallback Static Data)
- **Severity:** Low
- **Location(s):** `src/app/(website)/services/page.tsx`, `src/app/(website)/services/[slug]/page.tsx`
- **Description:** Catalog pages attempt to fetch from MySQL via Prisma and fall back to `src/data/services.ts` if the database is empty or throws an error. While resilient for initial setup, this introduces data inconsistency if static fallbacks drift from DB records.
- **Suggested Fix:** Ensure database seeding (`prisma/seed.ts`) is mandatory on environment deployment and remove fallback branching in production paths.

---

### [QUAL-2] Redundant Document Metadata Formatting Logic Across Route Handlers
- **Severity:** Low
- **Location(s):** `src/app/api/applications/route.ts` (Lines 30-42), `src/app/api/applications/[id]/route.ts` (Lines 35-48)
- **Description:** Duplicate code blocks map Prisma `ApplicationDocument` records into the `uploadedDocs` object dictionary format.
- **Suggested Fix:** Extract document array transformation into a shared utility function `formatApplicationDocuments(documents: ApplicationDocument[])` inside `src/lib/applications.ts`.
